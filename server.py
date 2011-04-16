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
import spec

from jsonencoder import jsond

urls = (
        '/', 'page',
        '/login', 'login',
        '/logout', 'logout',
        '/tmpl', 'tmpl',
        '/api/?', 'api_info',
        '/api/(.+)', 'api',
        )

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

import webassets.loaders

loader = webassets.loaders.YAMLLoader('assets.yaml')
assets_env = loader.load_environment()
assets_env.debug = web.config.debug
jsfiles = assets_env['js_all'].urls()
cssfiles = assets_env['css_all'].urls()

def set_no_cache():
    web.header('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')

def set_max_cache():
    web.header('Cache-Control', 'max-age=315360000')

class page:
    def GET(self):
        set_no_cache()
        return render.page(jsfiles, cssfiles, conf.debug)

class tmpl:
    def GET(self):
        set_no_cache()
        # TODO find a better way for this.
        name = web.input().get('name', None)
        if name:
            return getattr(render, name)()
        else:
            raise web.notfound()

class logout:
    def GET(self):
        session.kill()
        raise web.seeother("/")

class api_info:
    def GET(self):
        return render.api_info()

def get_input(s):
    '''
    Helper method to validate input data accroding to the spec.
    '''
    errors = spec.validate(s, web.input())
    if errors:
        raise web.badrequest()
    return web.input()

class api:
    GET_ACTIONS = set('stream current_user userinfo get_message validate'.split())
    POST_ACTIONS = set('register login logout publish follow unfollow\
            update_profile upload_photo'.split())
    FILTERS = {
            'uid': re.compile(r'[a-zA-Z][a-zA-Z0-9]+'),
            'email': re.compile(r'(.+)@(.+).(.+)'),
            }
    VALIDATE_SPECS = {
            'register': {
                'uid': FILTERS['uid'],
                'email': FILTERS['email'],
                'password': True
                },
            'login': {
                'uid': FILTERS['uid'],
                'password': True
                },
            'publish': {
                'content': True
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
                'email': (FILTERS['email'], False)
                },
            'get_message': {
                'id': True
                },
            'validate': {
                'action': True,
                }
            }
    EXTRACT_SPECS = {
            'userinfo': {
                'name': (str, ''),
                'uid': str,
                'bio': (str, ''),
                'location': (str, ''),
                'web': (str, ''),
                'following': (len, []),
                'follower': (len, []),
                },
            'current_user': {
                'name': (str, ''),
                'email': str,
                'uid': str,
                'bio': (str, ''),
                'location': (str, ''),
                'web': (str, ''),
                'following': (len, []),
                'follower': (len, []),
                }
            }

    def GET(self, action):
        web.header('Content-Type', 'application/json')
        set_no_cache()

        # check if we have the action
        if action not in self.GET_ACTIONS:
            return error.wrong_action()

        # get the input data if we have the spec
        if action in self.VALIDATE_SPECS:
            d = get_input(self.VALIDATE_SPECS[action])

        uuid = session.get('uuid', None)
        if not uuid:
            return error.not_logged_in()

        if action == 'stream':
            return jsond(db.stream(uuid))
        elif action == 'current_user':
            u = db.get_user(uuid)
            return jsond(spec.extract(self.EXTRACT_SPECS['current_user'], u))

        elif action == 'userinfo':
            u = db.find_user(d.uid)
            if not u:
                return error.user_not_found()
            return jsond(spec.extract(self.EXTRACT_SPECS['userinfo'], u))

        elif action == 'get_message':
            m = db.get_message(d.id)
            if m:
                return jsond(m)
            else:
                return error.message_not_found()

        elif action == 'validate':
            act = d.action
            if act in self.VALIDATE_SPECS:
                errors = spec.validate(self.VALIDATE_SPECS[act], web.input())
                if errors:
                    return jsond(errors)
                else:
                    return jsond({ 'success':1 })
            else:
                return error.wrong_action()

        return error.not_implemented()

    def POST(self, action):
        web.header('Content-Type', 'application/json')
        set_no_cache()

        # check if we have the action
        if action not in self.POST_ACTIONS:
            return error.wrong_action()

        # get the input data if we have the spec
        if action in self.VALIDATE_SPECS:
            d = get_input(self.VALIDATE_SPECS[action])

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
            return jsond(spec.extract(self.EXTRACT_SPECS['current_user'], u))

        elif action == 'upload_photo':
            try:
                d = web.input(photo={})
                if 'photo' in d:
                    u = db.get_user(uuid)
                    photo.resize_save(u['uid'], d.photo.file)
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

