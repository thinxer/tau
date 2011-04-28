# This module used some tricks to expose those error functions.
# Usage:
#   import error
#   def foo:
#       return error.not_implemented('bar')

# error list
errors = 'not_logged_in wrong_action not_implemented invalid_uid wrong_login\
        photo_upload_failed user_not_found message_not_found \
        stream_type_not_supported invalid_message_id'.split()

# a callable class
class error_func(object):
    def __init__(self, errno, desc):
        from jsonencoder import jsond
        self.errno = errno
        self.desc = desc
        self.jsond = jsond

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
import sys
for i in range(len(errors)):
    setattr(sys.modules[__name__], errors[i], error_func(-1 - i, errors[i]))

# unexpose unnecessary variables
del i
del sys
del error_func
