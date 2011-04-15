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

# XXX consider add user id to hash
def passwd_hash(password):
    return hashlib.md5(conf.secret + '|' + password).hexdigest()

conn = pymongo.Connection()
db = conn[conf.db_name]

users = db.users
messages = db.messages

# TODO use hash to mask the password
def register(uid, email, password):
    if uid in conf.reserved_names or users.find_one({'uid': uid}):
        return error.invalid_uid(raw=True)
    users.save({ 'uid': uid,
        'email': email,
        'password': passwd_hash(password),
        'following': []
        })
    # TODO check result
    return {'success': 1,
            'uid': uid }

def unregister(uuid, password):
    u = users.find_one({'_id': uuid, 'password': passwd_hash(password)})
    if u:
        users.remove(u)
        return {'success': 1}
    else:
        return error.user_not_found(raw=True)

def checkLogin(uid, password):
    # TODO check result
    return users.find_one({'uid': uid,
        'password': passwd_hash(password)})

def get_user(uuid):
    try:
        return users.find_one(ObjectId(uuid))
    except:
        return None

def find_user(uid):
    return users.find_one({'uid': uid})

def follow(uuid, target):
    '''
    make uid follow target
    '''
    u = find_user(target)
    if u:
        # TODO check result
        users.update({'_id': ObjectId(uuid)}, {'$addToSet': {'following': u['_id']}})
        return { 'success':1 }
    else:
        return error.user_not_found()

def unfollow(uuid, target):
    # TODO check result
    u = find_user(target)
    if u:
        users.update({'_id': ObjectId(uuid)}, {'$pull': {'following': u['_id']}})
        return { 'success':1 }
    else:
        return error.user_not_found()

def publish(uuid, content):
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
    try:
        return messages.find_one(ObjectId(uuid))
    except Exception, e:
        return None

def stream(uuid):
    # first get following list
    u = get_user(uuid)
    following = u['following']
    # then find messages published by his followings
    c = messages.find({'owner': {'$in': following}})
    ret = list(c)
    return ret

def update_profile(uuid, profile):
    u = users.find_one(ObjectId(uuid))
    for key in 'email name location bio web'.split():
        if profile.has_key(key):
            u[key] = profile[key]
    users.save(u)
    return u
