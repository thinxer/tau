#!/usr/bin/env python2
import json

def make(locale):
    import os.path
    in_file = os.path.join(os.path.dirname(__file__), locale+'.json')
    out_file = os.path.join(os.path.dirname(__file__),
            '../static/javascript/i18n/' + locale + '.js')
    with open(in_file) as i:
        json = i.read()
    js = '// Automatically generated by i18n/makejs.py.\n' +\
         '_.load(' + json + ');'
    with open(out_file, 'w') as o:
        o.write(js)

if __name__  == '__main__':
    import sys
    locale = sys.argv[1]
    make(locale)

