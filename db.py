import pymongo
import conf

conn = pymongo.Connection()
db = conn[conf.db_name]

users = db.users
messages = db.messages

def register(uid, email, password):
    pass

def userinfo(uid):
    pass

def create(uid, msg):
    pass

def delete(uid, msg):
    pass

def messages(uid, offset, limit):
    pass
