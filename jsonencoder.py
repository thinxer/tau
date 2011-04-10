import json
import bson
import datetime

class TauEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            return o.ctime()
        elif isinstance(o, bson.objectid.ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

def jsond(d):
    return json.dumps(d, cls=TauEncoder)
