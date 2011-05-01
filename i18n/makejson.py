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

while True:
    l = sys.stdin.readline()
    if not l:
        break
    s = eval(l)
    if s not in d:
        d[s] = ""

new = json.dumps(d, sort_keys=True, indent=0, ensure_ascii=False)
open(locale + '.json', 'w').write(new.encode('utf8'))
