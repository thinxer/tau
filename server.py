#!/usr/bin/env python

import exceptions
import re
import traceback
import web

import conf
import db
import error
import photo
import session

from jsonencoder import jsond

urls = (
        '/', 'page',
        '/login', 'login',
        '/logout', 'logout',
        '/tmpl', 'tmpl',
        '/api/?', 'api_info',
        '/api/(.+)', 'api',
        )

# Turn off debug to use session
web.config.debug = conf.debug
app = web.application(urls, globals())
render = web.template.render('templates/')

def createSession():
    return web.session.Session(app, session.MongoStore(db.db, 'sessions'))

if web.config.debug:
    # dirty hack to make session work with reloader
    if web.config.get('_session'):
        session = web.config._session
    else:
        session = createSession()
        web.config._session = session
else:
    session = createSession()

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
    E = exceptions.Exception
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
                raise E('key ' + key + ' is required')
            else:
                # default to f
                value = i.get(key, f)
                # regex
                if hasattr(f, 'match'):
                    if key not in i or not f.match(value):
                        raise E('regex for %s can\'t match %s' % (key, value))
                # callable
                elif callable(f):
                    if key not in i or not f(value):
                        raise E('%s didn\'t pass callable for %s' % (value, key))
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
    GET_ACTIONS = set('stream current_user userinfo'.split())
    POST_ACTIONS = set('register login logout publish follow unfollow\
            update_profile upload_photo'.split())
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
                },
            'update_profile': {
                'email': FILTERS['email'],
                'name': '',
                'location': '',
                'bio': '',
                'web': ''
                }
            }

    def GET(self, action):
        web.header('Content-Type', 'application/json')

        # check if we have the action
        if action not in self.GET_ACTIONS:
            return error.wrong_action()

        # get the input data if we have the spec
        if action in self.INPUT_SPECS:
            d = get_input(self.INPUT_SPECS[action])

        uuid = session.get('uuid', None)
        if not uuid:
            return error.not_logged_in()

        if action == 'stream':
            return jsond(db.stream(uuid))
        elif action == 'current_user':
            u = db.get_user(uuid)
            return jsond({
                'uid': u['uid'],
                'email': u['email'],
                'location': u.get('location', ''),
                'bio': u.get('bio', ''),
                'web': u.get('web', ''),
                'following': len(u['following'])
                })
        elif action == 'userinfo':
            u = db.find_user(d.uid)
            if not u:
                return error.user_not_found()
            return jsond({
                'uid': u['uid'],
                'location': u.get('location', ''),
                'bio': u.get('bio', ''),
                'web': u.get('web', ''),
                'following': len(u['following'])
                })

        return error.not_implemented()

    def POST(self, action):
        web.header('Content-Type', 'application/json')

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
                session.uuid = str(u['_id'])
                return jsond({
                    'uid': u['uid']
                    })
            else:
                return error.wrong_login()

        # check login
        uuid = session.get('uuid', None)
        if not uuid:
            return error.not_logged_in()

        if action == 'follow':
            return jsond(db.follow(uuid, d.target))
        elif action == 'unfollow':
            return jsond(db.unfollow(uuid, d.target))
        elif action == 'publish':
            return jsond(db.publish(uuid, d.content))
        elif action == 'update_profile':
            u = db.update_profile(uuid, d)
            return jsond({
                'uid': u['uid'],
                'location': u.get('location', ''),
                'bio': u.get('bio', ''),
                'web': u.get('web', ''),
                'following': len(u['following'])
                })
        elif action == 'upload_photo':
            try:
                d = web.input(photo={})
                if 'photo' in d:
                    # XXX uid
                    photo.resize_save(uid, d.photo.file)
                return jsond({ 'success':1 })
            except Exception, e:
                traceback.print_exc()
                return error.photo_upload_failed()
        elif action == 'logout':
            session.kill()
            return jsond({ 'success':1 })

        return error.not_implemented()


# export wsgi application
application = app.wsgifunc()

# if not run as wsgi, start web.py built-in server
if __name__ == '__main__':
    app.run()

