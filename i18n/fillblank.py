#!/usr/bin/env python2
import sys
import json

locale = sys.argv[1]
try:
    orig = open(locale + '.json').read()
    if orig.strip():
        d = json.loads(orig)
except:
    d = {}

for k in d.keys():
    if not d[k]:
        s = raw_input(k+'\n')
        d[k] = s.decode('utf8')

new = json.dumps(d, sort_keys=True, indent=0, ensure_ascii=False, separators=(',',':'))
open(locale + '.json', 'w').write(new.encode('utf8'))
