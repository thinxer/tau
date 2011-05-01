#!/usr/bin/env python2
import re
import sys

tmpl = re.compile(r'_\((.*?)\)')

for filename in sys.argv:
    f = open(filename)
    for item in tmpl.finditer(f.read()):
        s = item.groups()[0]
        sys.stdout.write(s + '\n')
    f.close()
