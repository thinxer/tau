import datetime

EPOCH = datetime.datetime(1970, 1, 1)
def toTimestamp(dt):
    ''' dt is a datetime.datetime '''
    diff = dt - EPOCH
    return diff.days*86400000 + diff.seconds*1000 + diff.microseconds/1000

def parseTimestamp(time):
    days = time/86400000
    seconds = (time % 86400000)/1000
    microseconds = (time % 1000) * 1000;
    return EPOCH + datetime.timedelta(days, seconds, microseconds)
