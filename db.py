'''
The db module.
WARNING This module is not responsible for permission check.
'''
import pymongo
import datetime

import conf
import error
import contentparser

utcnow = datetime.datetime.utcnow

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
        'password': password,
        'following': []
        })
    # TODO check result
    return {'success': 1,
            'uid': uid }

def checkLogin(uid, password):
    # TODO check result
    return users.find_one({'uid': uid,
        'password': password})

def userinfo(uid):
    return users.find_one({'uid': uid})

def follow(uid, target):
    '''
    make uid follow target
    '''
    # TODO check result
    users.update({'uid': uid}, {'$addToSet': {'following': target}})
    return { 'success':1 }

def unfollow(uid, target):
    # TODO check result
    users.update({'uid': uid}, {'$pull': {'following': target}})
    return { 'success':1 }

def publish(uid, content):
    doc = {
            'owner': uid,
            'content': content,
            'timestamp': utcnow(),
            'entities': contentparser.parse(content)
            }
    # TODO check result
    messages.save(doc)
    return { 'success':1 }

def stream(uid):
    # first get following list
    u = users.find_one({'uid': uid})
    following = u['following']
    # then find messages published by his followings
    c = messages.find({'owner': {'$in': following}})
    ret = list(c)
    return ret

def update_profile(uid, profile):
    u = users.find_one({'uid': uid})
    for key in 'email name location bio web'.split():
        u[key] = profile[key]
    users.save(u)
    return u
