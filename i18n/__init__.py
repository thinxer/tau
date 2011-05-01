import json

trans = {}

def load(locale):
    global trans
    trans = json.load(open('i18n/' + locale + '.json'))

def gettext(msg, *args):
    m = trans[msg] if msg in trans else msg
    return m % args
