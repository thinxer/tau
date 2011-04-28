#!/usr/bin/env python

import exceptions
import re
import traceback
import web
import bson

import conf
import db
import error
import photo
import spec
import util

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
render = web.template.render('template/')

def createSession():
    if conf.session_type == 'mongo':
        import session_mongo
        return web.session.Session(app, session_mongo.MongoStore(db.db, 'sessions'))
    elif conf.session_type == 'memcache':
        # TODO add more memcache options to conf
        import session_memcache
        return web.session.Session(app, session_memcache.MemcacheStore(['127.0.0.1:11211'], 1440))

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

if not conf.debug:
    jsfiles = [x+'?'+conf.version for x in jsfiles]
    cssfiles = [x+'?'+conf.version for x in cssfiles]

def set_no_cache():
    web.header('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')

def set_max_cache():
    web.header('Cache-Control', 'max-age=315360000')

def set_cache_control():
    if (not conf.debug) and web.input().get('v'):
        set_max_cache()
    else:
        set_no_cache()

class page:
    def GET(self):
        set_cache_control()
        return render.page(conf.version, jsfiles, cssfiles, conf.debug)

class tmpl:
    def GET(self):
        set_cache_control()
        name = web.input().get('name', None)
        if name:
            return getattr(render, name)(version = conf.version)
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
    GET_ACTIONS = set('stream current_user userinfo get_message validate\
            get_following get_follower recommend_user'.split())
    POST_ACTIONS = set('register login logout publish follow unfollow\
            update_profile upload_photo'.split())
    FILTERS = {
            'uid': re.compile(r'[a-zA-Z][a-zA-Z0-9]+'),
            'email': re.compile(r'(.+)@(.+).(.+)'),
            'datetime': lambda _: _ and int(_) or None,
            'objectid': lambda _: bson.objectid.ObjectId(_)
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
                'content': True,
                'parent': (FILTERS['objectid'], False),
                'type': (lambda _: _ in ['normal', 'reply', 'forward'], False)
                },
            'follow': {
                'uid': FILTERS['uid']
                },
            'unfollow': {
                'uid': FILTERS['uid']
                },
            'userinfo': {
                'uid': FILTERS['uid']
                },
            'update_profile': {
                'email': (FILTERS['email'], False)
                },
            'get_message': {
                'id': FILTERS['objectid']
                },
            'validate': {
                'action': True,
                },
            'stream': {
                'olderThan': (FILTERS['datetime'], False),
                'newerThan': (FILTERS['datetime'], False),
                'uid': (FILTERS['uid'], False)
                },
            'get_following': {
                'uid': FILTERS['uid']
                },
            'get_follower': {
                'uid': FILTERS['uid']
                }
            }
    EXTRACT_SPECS = {
            'userinfo': {
                'name': (spec.untaint, ''),
                'uid': str,
                'bio': (spec.untaint, ''),
                'location': (spec.untaint, ''),
                'web': (spec.untaint, ''),
                'following': (len, []),
                'follower': (len, []),
                'photo': (spec.untaint, conf.default_photo_uri)
                },
            'current_user': {
                'name': (spec.untaint, ''),
                'email': spec.untaint,
                'uid': str,
                'bio': (spec.untaint, ''),
                'location': (spec.untaint, ''),
                'web': (spec.untaint, ''),
                'following': (len, []),
                'follower': (len, []),
                'photo': (spec.untaint, conf.default_photo_uri)
                },
            'stream_item': {
                'id': str,
                'uid': spec.untaint,
                'content': spec.untaint,
                'timestamp': spec.untaint,
                'entities': spec.untaint,
                'parent': (spec.untaint, None),
                'type': (spec.untaint, 'normal'),
                'parent_message': (lambda _: _ and
                    spec.extract(api.EXTRACT_SPECS['stream_item'], _) or None,
                    None)
                },
            'stream_response': {
                'has_more': spec.untaint,
                'items': lambda items: [
                    spec.extract(api.EXTRACT_SPECS['stream_item'], item)
                    for item in items],
                'users': lambda uid_dict: dict([
                    (k, spec.extract(api.EXTRACT_SPECS['userinfo'],v))
                    for k, v in uid_dict.iteritems()])
                },
            'stream_request': {
                'olderThan': (lambda _: _ and util.parseTimestamp(int(_)) or None, None),
                'newerThan': (lambda _: _ and util.parseTimestamp(int(_)) or None, None),
                'uid': (spec.untaint, None),
                'type': (str, 'normal')
                },
            'publish_request': {
                'content': spec.untaint,
                'parent': (FILTERS['objectid'], None),
                'type': (str, 'normal')
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
            param = spec.extract(self.EXTRACT_SPECS['stream_request'], d)
            ret = db.stream(uuid, **param)
            if 'error' in ret:
                return jsond(ret)
            else:
                return jsond(spec.extract(self.EXTRACT_SPECS['stream_response'], ret))

        elif action == 'current_user':
            u = db.get_user(uuid)
            return jsond(spec.extract(self.EXTRACT_SPECS['current_user'], u))

        elif action == 'userinfo':
            u = db.find_user(d.uid)
            if not u:
                return error.user_not_found()
            return jsond(spec.extract(self.EXTRACT_SPECS['userinfo'], u))

        elif action == 'get_following':
            ret = db.get_following(d.uid)
            new_items = [spec.extract(self.EXTRACT_SPECS['userinfo'], u) for u in ret['items']]
            ret['items'] = new_items
            return jsond(ret)

        elif action == 'get_follower':
            ret = db.get_follower(d.uid)
            new_items = [spec.extract(self.EXTRACT_SPECS['userinfo'], u) for u in ret['items']]
            ret['items'] = new_items
            return jsond(ret)

        elif action == 'get_message':
            ret = db.get_message(d.id)
            if ret:
                return jsond(spec.extract(self.EXTRACT_SPECS['stream_response'], ret))
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

        elif action == 'recommend_user':
            return jsond({
                'users': [spec.extract(self.EXTRACT_SPECS['userinfo'], u)
                    for u in db.recommend_user(uuid)]
                })

        return error.not_implemented()

    def POST(self, action):
        if action == 'upload_photo':
            # this is to prevent IE from downloading the JSON.
            web.header('Content-Type', 'text/plain')
        else:
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
            return jsond(db.follow(uuid, d.uid))
        elif action == 'unfollow':
            return jsond(db.unfollow(uuid, d.uid))
        elif action == 'publish':
            req = spec.extract(self.EXTRACT_SPECS['publish_request'], d)
            return jsond(db.publish(uuid, **req))
        elif action == 'update_profile':
            u = db.update_profile(uuid, d)
            return jsond(spec.extract(self.EXTRACT_SPECS['current_user'], u))

        elif action == 'upload_photo':
            try:
                d = web.input(photo={})
                if 'photo' in d:
                    u = db.get_user(uuid)
                    photo.resize_save(u['uid'], d.photo.file)
                    if db.update_photo(uuid, True).has_key('success'):
                        return jsond({ 'success':1 })
                return error.photo_upload_failed()
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

