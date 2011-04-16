import exceptions
import traceback

class ValidateError(exceptions.Exception):
    def __init__(self, key, value, type):
        self.key = key
        self.value = value
        self.type = type

    def __str__(self):
        return 'value %s of key %s didn\'t pass validation of %s' % \
                    (self.value, self.key, self.type)

    def getError(self):
        return {
                'key': self.key,
                'value': self.value,
                'type': self.type
                }

def validate(spec, doc):
    '''
    example spec:
        {
            'name': (re.compile('[a-z]+'), False),  # regex filter (optional)
            'age': lambda _: int(_) < 10,           # callable filter
            'sex': True,                            # required
        }
    '''
    try:
        for key, f in spec.items():
            if key not in doc:
                if f is not False or (isinstance(f, tuple) and f[1]):
                    raise ValidateError(key, None, 'required')
            else:
                if isinstance(f, tuple):
                    f = f[0]
                value = doc.get(key)
                # regex
                if hasattr(f, 'match'):
                    if not f.match(value):
                        raise ValidateError(key, value, 'regex')
                # callable
                elif callable(f):
                    if not f(value):
                        raise ValidateError(key, value, 'callable')
                elif isinstance(f, bool):
                    pass
                else:
                    raise ValidateError(key, value, 'unkown_validator')
        # no error
        return None
    except ValidateError, e:
        return e.getError()
    except Exception, e:
        traceback.print_exc()
        return ValidateError(None, None, 'unknown').getError()

def extract(spec, doc, toDoc = None, keepNone = True):
    '''
    keepNone: set value to None if doc doesn't have the key specified in spec.

    toDoc: extract to toDoc.

    example spec:
        {
            'name': str,
            'age': (int, 0),
            'password': lambda p: hash(salt+p)
        }
    or:
        ['name', 'age']
    '''
    if toDoc is None:
        ret = {}
    else:
        ret = toDoc

    if isinstance(spec, dict):
        for key, f in spec.items():
            if isinstance(f, tuple):
                func, default = f
                ret[key] = func(doc.get(key, default))
            else:
                if keepNone or doc.has_key(key):
                    ret[key] = f(doc.get(key))
    else:
        for key in spec:
            if keepNone or doc.has_key(key):
                ret[key] = doc.get(key)
    return ret
