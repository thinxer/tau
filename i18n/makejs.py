#!/usr/bin/env python2
import sys
import json

locale = sys.argv[1]
json = open(locale + '.json').read()
js = '// Automatically generated by i18n/makejs.py.\n' +\
     '_.load(' + json + ');'
open('../static/javascript/i18n/' + locale + '.js', 'w').write(js)