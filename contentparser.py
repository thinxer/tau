#!/usr/bin/env python2
# coding: utf-8
import re

hash_pattern = re.compile('#.*?#')
mention_pattern = re.compile('@\w+')
url_pattern = re.compile(r'(?i)\b((?:(ht|f)tps?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:\'".,<>?«»“”‘’]))')


#TODO add tests to this parser
#TODO prevent spans from overlap
def parse(msg):
    '''
    This function will extract @mentions, #tags# and urls with their indexes.
    '''
    mentions = [{
        'span': x.span(),
        'mention': x.group(),
        } for x in mention_pattern.finditer(msg)]
    tags = [{
        'span': x.span(),
        'hash': x.group()
        } for x in hash_pattern.finditer(msg)]
    urls = [{
        'span': x.span(),
        'url': x.group(),
        } for x in url_pattern.finditer(msg)]
    return {
            'mentions': mentions,
            'tags': tags,
            'urls': urls
            }

# unexpose unnecessary variables
del re

if __name__ == '__main__':
    from pprint import pprint
    pprint(parse('@userA @userB just a#tag#oh y#ea#h and a http://google.com @then?'))
