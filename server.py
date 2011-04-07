#!/usr/bin/env python

import exceptions
import json
import re
import traceback
import web

import conf
import db
import error
import session

jsond = lambda _: json.dumps(_)

urls = (
        '/', 'page',
        '/login', 'login',
        '/logout', 'logout',
        '/tmpl', 'tmpl',
        '/api/?', 'api_info',
        '/api/(.+)', 'api',
        )

# Turn off debug to use session
web.config.debug = False
app = web.application(urls, globals())
render = web.template.render('templates/')
session = web.session.Session(app, session.MongoStore(db.db, 'sessions'))

class page:
    def GET(self):
        logged_in = True
        if logged_in:
            return render.page()
        else:
            return render.public_index()

class tmpl:
    def GET(self):
        # TODO find a better way for this.
        name = web.input().get('name', None)
        if name:
            return getattr(render, name)()
        else:
            raise web.notfound()

class login:
    def GET(self):
        return render.login()

class logout:
    def GET(self):
        session.kill()
        raise web.seeother("/")

class api_info:
    def GET(self):
        return render.api_info()
        
def get_input(spec):
    '''
    Helper method to extract input data accroding to the spec.
    spec example:
        {
            'name': re.compile('[a-z]+'),   # regex filter
            'age': lambda _: int(_) < 10,   # callable filter
            'sex': None,                    # required
            'bio': 'nothing here'           # default value (optional value)
        }
    '''
    try:
        ret = {}
        i = web.input()
        for key, f in spec.items():
            if f is None and key not in i:
                raise self.E('key ' + key + ' is required')
            else:
                # default to f
                value = i.get(key, f)
                # regex
                if hasattr(f, 'match'):
                    if key not in i or not f.match(value):
                        raise self.E('regex for %s can\'t match %s' % (key, value))
                # callable
                elif callable(f):
                    if key not in i or not f(value):
                        raise self.E('%s didn\'t pass callable for %s' % (value, key))
                # no check, f is default value
                else:
                    pass
            ret[key] = value
        return web.Storage(ret)
    except Exception, e:
        # error while checking
        traceback.print_exc()
        raise web.badrequest()

class api:
    GET_ACTIONS = set('stream current_user userinfo'.split(' '))
    POST_ACTIONS = set('register login logout publish follow unfollow'.split(' '))
    E = exceptions.Exception
    FILTERS = {
            'uid': re.compile(r'[a-zA-Z][a-zA-Z0-9]+'),
            'email': re.compile(r'(.+)@(.+).(.+)'),
            }
    INPUT_SPECS = {
            'register': {
                'uid': FILTERS['uid'],
                'email': FILTERS['email'],
                'password': None
                },
            'login': {
                'uid': FILTERS['uid'],
                'password': None
                },
            'publish': {
                'content': None
                },
            'follow': {
                'target': FILTERS['uid']
                },
            'unfollow': {
                'target': FILTERS['uid']
                },
            'userinfo': {
                'uid': FILTERS['uid']
                }
            }

    def GET(self, action):
        # check if we have the action
        if action not in self.GET_ACTIONS:
            return error.wrong_action()

        # get the input data if we have the spec
        if action in self.INPUT_SPECS:
            d = get_input(self.INPUT_SPECS[action])

        uid = session.get('uid', None)
        if not uid:
            return error.not_logged_in()

        if action == 'stream':
            return jsond(db.stream(uid))
        elif action == 'current_user':
            return jsond({
                'uid': uid,
                })
        elif action == 'userinfo':
            return jsond(db.userinfo(d.uid))

        return error.not_implemented()

    def POST(self, action):
        # check if we have the action
        if action not in self.POST_ACTIONS:
            return error.wrong_action()

        # get the input data if we have the spec
        if action in self.INPUT_SPECS:
            d = get_input(self.INPUT_SPECS[action])

        # act
        if action == 'register':
            return jsond(db.register(d.uid, d.email, d.password))
        elif action == 'login':
            u = db.checkLogin(d.uid, d.password)
            if u:
                session.uid = u['uid']
                return jsond({
                    'uid': u['uid']
                    })
            else:
                return error.wrong_login()

        # check login
        uid = session.get('uid', None)
        if not uid:
            return error.not_logged_in()

        if action == 'follow':
            return jsond(db.follow(uid, d.target))
        elif action == 'unfollow':
            return jsond(db.unfollow(uid, d.target))
        elif action == 'publish':
            return jsond(db.publish(uid, d.content))
        elif action == 'logout':
            session.kill()
            return jsond({ 'success':1 })

        return error.not_implemented()

if __name__ == '__main__':
    app.run()
