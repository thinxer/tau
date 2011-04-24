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

utcnow = datetime.datetime.utcnow

def passwd_hash(uuid, password):
    ''' compute hashed password '''
    return hashlib.md5(conf.secret + '|' + password + '|' + uuid).hexdigest()

conn = pymongo.Connection()
db = conn[conf.db_name]

users = db.users
messages = db.messages

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

def publish(uuid, content):
    u = get_user(uuid)
    doc = {
            'owner': ObjectId(uuid),
            'content': content,
            'timestamp': utcnow(),
            'entities': contentparser.parse(content)
            }
    # TODO check result
    messages.save(doc)
    return { 'success':1 }

def get_message(uuid):
    m = messages.find_one(ObjectId(uuid))
    if m:
        u = get_user(m['owner'])
        if u:
            m['uid'] = u['uid']
            m['id'] = str(m['_id'])
            return {
                    'item': m,
                    'user': u
                    }
    return None

def stream(uuid, olderThan = None, newerThan = None, uid = None):
    # TODO make clear newerThan logic.

    # setup basic query
    u = get_user(uuid)
    if uid:
        # get uid's public tweets
        target = find_user(uid)
        if target:
            query = { 'owner':target['_id'] }
        else:
            # it's more convient to return nothing than an error
            return {
                    'has_more': False,
                    'items': [],
                    'users': []
                    }
    else:
        # get current user's main timeline
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

    ret = []
    user_set = set()

    # The logic here is to make sure we won't break in 'a' time.
    # e.g. When multiple messages are at the same time, we make sure
    # to retrieve them together.
    last_datetime = None
    count = 0
    for item in c:
        if count > conf.stream_item_max and item['timestamp'] != last_datetime:
            break
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

    for item in ret:
        item['id'] = str(item['_id'])
        u = uuid_dict.get(str(item['owner']))
        item['uid'] = u and u['uid'] or '!invalid'

    return {
            'items': ret,
            'users': uid_dict,
            'has_more': c.alive
            }

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

# TODO enable paging
def get_following(uid):
    u = find_user(uid)
    if not u:
        return error.user_not_found(raw=True)
    ret = {
            'has_more': false,
            'items': [get_user(uuid) for uuid in u['following']]
            }
    return ret

# TODO enable paging
def get_follower(uid):
    u = find_user(uid)
    if not u:
        return error.user_not_found(raw=True)
    ret = {
            'has_more': false,
            'items': [get_user(uuid) for uuid in u['follower']]
            }
    return ret

def recommend_user(uuid):
    ''' naive user recommendation. '''
    u = get_user(uuid)
    if u:
        return list(users.find({'_id': {'$nin': u['following']}})
                .limit(conf.stream_item_max))
    else:
        return error.user_not_found(raw=True)

