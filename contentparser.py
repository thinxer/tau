import re

hash_pattern = re.compile('#.*?#')
mention_pattern = re.compile('@\w+')
url_pattern = re.compile('(?#Protocol)(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?#Username:Password)(?:\w+:\w+@)?(?#Subdomains)(?:(?:[-\w]+\.)+(?#TopLevel Domains)(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum|travel|[a-z]{2}))(?#Port)(?::[\d]{1,5})?(?#Directories)(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?#Query)(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?#Anchor)(?:#(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)?')


#TODO add tests to this parser
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
