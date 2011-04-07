import pymongo
import conf
import error

conn = pymongo.Connection()
db = conn[conf.db_name]

users = db.users
messages = db.messages

def register(uid, email, password):
    if uid in conf.reserved_names or users.find_one({"uid": uid}):
        return error.invalid_uid(raw=True)
    users.save({ "uid": uid,
        "email": email,
        "password": password
        })
    return {'success': 1,
            'uid': uid }

def userinfo(uid):
    pass

def create(uid, msg):
    pass

def delete(uid, msg):
    pass

def messages(uid, offset, limit):
    pass
