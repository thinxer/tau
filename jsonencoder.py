import json
import bson
import datetime
import util

class TauEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            # assume to be UTC time
            return util.toTimestamp(o)
        elif isinstance(o, bson.objectid.ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

def jsond(d):
    return json.dumps(d,
            cls=TauEncoder,
            ensure_ascii=False,
            separators=(',',':'))
