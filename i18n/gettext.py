#!/usr/bin/env python2
import re
import sys

tmpl = re.compile(r'_\((.*?)\)')
es = re.compile(r'(".*?")|(\'.*?\')')

for filename in sys.argv:
    f = open(filename)
    for item in tmpl.finditer(f.read()):
        s = item.groups()[0]
        c = es.search(s).groups()
        s = c[0] or c[1]
        sys.stdout.write(s + '\n')
    f.close()
