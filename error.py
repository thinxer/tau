# This module used some tricks to expose those error functions.
# Usage:
#   import error
#   def foo:
#       return error.not_implemented('bar')

# error list
__errors = 'not_logged_in wrong_action not_implemented invalid_uid'.split(' ')

# a callable class
class __error_func(object):
    def __init__(self, errno, desc):
        import json
        self.errno = errno
        self.desc = desc
        self.jsond = json.dumps

    def __call__(self, info='', raw=False):
        doc = {
            'error': self.errno,
            'desc': self.desc,
            'info': info
            }
        if raw:
            return doc
        return self.jsond(doc)

# force set the attr to this module
import sys as __sys
for __i in range(len(__errors)):
    setattr(__sys.modules[__name__], __errors[__i], __error_func(__i, __errors[__i]))
