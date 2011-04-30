'''
The db module.
WARNING This module is not responsible for permission check.
'''
import pymongo
import datetime
import hashlib
from bson.objectid import ObjectId

import conf
import error
import contentparser
import seg

utcnow = datetime.datetime.utcnow

def passwd_hash(uuid, password):
    ''' compute hashed password '''
    return hashlib.md5(conf.secret + '|' + password + '|' + uuid).hexdigest()

conn = pymongo.Connection()
db = conn[conf.db_name]

users = db.users
messages = db.messages
lists = db.lists

# ensure indexes
users.ensure_index('uid')
messages.ensure_index('owner')
messages.ensure_index('keywords')
messages.ensure_index('entities.mentions.mention')
messages.ensure_index('entities.tags.hash')
messages.ensure_index('timestamp')

def register(uid, email, password):
    if uid in conf.reserved_names or users.find_one({'uid': uid}):
        return error.invalid_uid(raw=True)
    # 2 steps save, as we need the ObjectId to compute the password
    uuid = users.save({})
    # TODO check result
    users.update({'_id': uuid}, {
        'uid': uid,
        'email': email,
        'password': passwd_hash(str(uuid), password),
        'following': [],
        'follower': []
        })
    return {'success': 1,
            'uid': uid }

def unregister(uuid, password):
    u = users.find_one({'_id': uuid, 'password': passwd_hash(uuid, password)})
    if u:
        users.remove(u)
        return {'success': 1}
    else:
        return error.user_not_found(raw=True)

def checkLogin(uid, password):
    # TODO check result
    u = find_user(uid)
    if u and u['password'] == passwd_hash(str(u['_id']), password):
        return u
    else:
        return None

def get_user(uuid):
    ''' get user object by uuid '''
    try:
        return users.find_one(ObjectId(uuid))
    except:
        return None

def find_user(uid):
    ''' find a user by uid '''
    return users.find_one({'uid': uid})

def follow(uuid, target):
    ''' make uid follow target '''
    u = find_user(target)
    if u:
        # TODO check result
        users.update({'_id': ObjectId(uuid)}, {'$addToSet': {'following': u['_id']}})
        users.update({'_id': u['_id']}, {'$addToSet': {'follower': ObjectId(uuid)}})
        return { 'success':1 }
    else:
        return error.user_not_found(raw=True)

def unfollow(uuid, target):
    # TODO check result
    u = find_user(target)
    if u:
        users.update({'_id': ObjectId(uuid)}, {'$pull': {'following': u['_id']}})
        users.update({'_id': u['_id']}, {'$pull': {'follower': ObjectId(uuid)}})
        return { 'success':1 }
    else:
        return error.user_not_found(raw=True)

def publish(uuid, content, parent = None, type = 'normal'):
    u = get_user(uuid)

    # We should not embed the parent message, otherwise it'd be too difficult
    # to delete the parent.
    if type == 'forward':
        m = messages.find_one(ObjectId(parent))
        if not m:
            return error.invalid_message_id(raw=True)

    doc = {
            'owner': ObjectId(uuid),
            'content': content,
            'timestamp': utcnow(),
            'entities': contentparser.parse(content),
            'parent': parent and ObjectId(parent) or None,
            'type': type,
            'keywords': list(set(seg.segment(content)))
            }
    # TODO check result
    messages.save(doc)
    return { 'success':1 }

def remove(uuid, msg_id):
    m = messages.find_one({'owner': ObjectId(uuid), '_id': ObjectId(msg_id)})
    if m:
        messages.remove(m)
        return { 'success':1 }
    else:
        # XXX more detailed error messages?
        return error.message_not_found(raw=True)

def _process_messages(cursor):
    '''
    This helper method will get around conf.stream_item_max items from cursor.
    '''
    ret = []
    user_set = set()

    # The logic here is to make sure we won't break in 'a' time.
    # e.g. When multiple messages are at the same time, we make sure
    # to retrieve them together.
    last_datetime = None
    count = 0
    for item in cursor:
        if count > conf.stream_item_max and item['timestamp'] != last_datetime:
            break
        if item.get('type', 'normal') == 'forward':
            m = messages.find_one(ObjectId(item['parent']))
            if m:
                item['parent_message'] = m
                user_set.add(str(m['owner']))

        user_set.add(str(item['owner']))
        ret.append(item)
        count += 1
        last_datetime = item['timestamp']

    uuid_dict = {}
    uid_dict = {}
    for uuid in user_set:
        u = get_user(uuid)
        if u:
            uuid_dict[uuid] = u
            uid_dict[u['uid']] = u

    # final pass
    for item in ret:
        item['id'] = str(item['_id'])
        u = uuid_dict.get(str(item['owner']))
        item['uid'] = u and u['uid'] or '!invalid'

        if item.get('type', 'normal') == 'forward':
            if 'parent_message' in item:
                embed = item['parent_message']
                embed['id'] = str(embed['_id'])
                uu = uuid_dict.get(str(embed['owner']))
                embed['uid'] = uu and uu['uid'] or '!invalid'

    return {
            'items': ret,
            'users': uid_dict,
            'has_more': cursor.alive
            }

def get_message(uuid, msg_id):
    c = messages.find({'_id': ObjectId(msg_id)})
    ret = _process_messages(c)
    if len(ret['items']) == 0:
        return error.message_not_found(raw=True)
    return ret

def stream(uuid, olderThan = None, newerThan = None, uid = None, list_id = None, type = 'normal'):
    '''
    olderThan, newerThan: time since epoch (in milliseconds).
    uid: if exist, return uid's public messages.
    type:
        normal: the home timeline for uuid.
        mentions: messages mentioning uuid.
        unique: only one message specified by msg_uuid.
        user: messages published by uid.
        list: message published by users in list_id.
    '''

    # setup basic query
    if type == 'unique':
        query = {
                '_id': ObjectId(msg_uuid)
                }
    elif type == 'normal':
        # uuid's home timeline
        u = get_user(uuid)
        following = u['following']
        following_query = {
                'owner': {'$in': following + [u['_id']]}
                }
        mention_query = {
                'entities.mentions.mention': '@' + u['uid']
                }
        query = {
                '$or': [following_query, mention_query]
                }
    elif type == 'mentions':
        query = {
                'entities.mentions.mention': '@' + u['uid']
                }
    elif type == 'user':
        # get uid's public tweets
        target = find_user(uid)
        if target:
            query = { 'owner':target['_id'] }
        else:
            return error.user_not_found(raw=True)
    elif type == 'list':
        l = lists.find_one(ObjectId(list_id))
        if l:
            query = { 'owner':{'$in':l['people']} }
        else:
            return error.list_not_found(raw=True)
    else:
        return error.stream_type_not_supported(raw=True)

    # setup time constraints
    if olderThan or newerThan:
        query['timestamp'] = {}
    if olderThan:
        query['timestamp']['$lt'] = olderThan
    if newerThan:
        query['timestamp']['$gt'] = newerThan

    # then execute the query
    c = messages.find(query) \
            .sort('timestamp', pymongo.DESCENDING) \
            .batch_size(conf.stream_item_max)

    return _process_messages(c)

def search(uuid, query=None, newerThan=None, olderThan=None):
    ''' uuid is currenly unused. '''
    keywords = seg.segment(query)

    # basic query
    query = {
            'keywords': {'$all': keywords}
            }

    # setup time constraints
    if olderThan or newerThan:
        query['timestamp'] = {}
    if olderThan:
        query['timestamp']['$lt'] = olderThan
    if newerThan:
        query['timestamp']['$gt'] = newerThan

    c = messages.find(query)
    return _process_messages(c)

def update_profile(uuid, profile):
    u = users.find_one(ObjectId(uuid))
    for key in 'email name location bio web'.split():
        if profile.has_key(key):
            u[key] = profile[key]
    users.save(u)
    return u

def update_photo(uuid, has_photo):
    u = users.find_one(ObjectId(uuid))
    u['photo_version'] = u.get('photo_version', 0) + 1
    if has_photo:
        u['photo'] = conf.photo_uri_prefix + u['uid'] + conf.photo_ext + '?' + str(u['photo_version'])
    else:
        u['photo'] = conf.default_photo_uri;
    users.save(u)
    return { 'success':1 }

def get_following(uuid, uid, skip=0):
    u = find_user(uid)
    if not u:
        return error.user_not_found(raw=True)
    max_index = skip + conf.stream_item_max
    ret = {
            'has_more': max_index < len(u['following']),
            'items': [get_user(uuid) for uuid in u['following'][skip:max_index]]
            }
    return ret

def get_follower(uuid, uid, skip=0):
    u = find_user(uid)
    if not u:
        return error.user_not_found(raw=True)
    max_index = skip + conf.stream_item_max
    ret = {
            'has_more': max_index < len(u['following']),
            'items': [get_user(uuid) for uuid in u['follower'][skip:max_index]]
            }
    return ret

def recommend_user(uuid):
    ''' naive user recommendation. '''
    # TODO more reasonable recommendation
    u = get_user(uuid)
    if u:
        return list(users.find({'_id': {'$nin': u['following'] + [u['_id']]}})
                .limit(conf.stream_item_max))
    else:
        return error.user_not_found(raw=True)

def create_list(uuid, list_name):
    list_id = lists.save({
        'curator': ObjectId(uuid),
        'name': list_name,
        'people': []
        })
    return { 'list_id':list_id }

def remove_list(uuid, list_id):
    l = lists.find_one({
        'curator': ObjectId(uuid),
        '_id': ObjectId(list_id)
        })
    if not l:
        return error.list_not_found(raw=True)
    lists.remove(l)
    return { 'success':1 }

def add_to_list(uuid, list_id, uid):
    u = find_user(uid)
    if not u:
        return error.user_not_found(raw=True)
    if not lists.find_one(ObjectId(list_id)):
        return error.list_not_found(raw=True)
    lists.update({ '_id': ObjectId(list_id) }, {
        '$addToSet':{'people': u['_id']}
        })
    return { 'success':1 }

def remove_from_list(uuid, list_id, uid):
    u = find_user(uid)
    if not u:
        return error.user_not_found(raw=True)
    if not lists.find_one(ObjectId(list_id)):
        return error.list_not_found(raw=True)
    lists.update({ '_id': ObjectId(list_id) }, {
        '$pull':{'people': u['_id']}
        })
    return { 'success':1 }

def get_lists(uuid, uid=None):
    target = ObjectId(uuid)
    if uid:
        u = find_user(uid)
        if u:
            target = u['_id']
        else:
            return error.user_not_found(raw=True)

    ret = list(lists.find({ 'curator': target }))
    for item in ret:
        item['id'] = str(item['_id'])
        u = get_user(item['curator'])
        item['curator'] = u and u['uid'] or '!invalid'

    return ret

def get_list_info(uuid, list_id):
    ret = lists.find_one(ObjectId(list_id))
    if ret:
        print ret
        u = get_user(ret['curator'])
        ret['id'] = ret['_id']
        ret['curator'] = u and u['uid'] or '!invalid'
    return ret or error.list_not_found(raw=True)

def get_list_users(uuid, list_id, skip):
    l = lists.find_one(ObjectId(list_id))
    if not l:
        return error.list_not_found(raw=True)
    max_index = skip + conf.stream_item_max
    ret = {
            'has_more': max_index < len(l['people']),
            'items': [get_user(uuid) for uuid in l['people'][skip:max_index]]
            }
    return ret
