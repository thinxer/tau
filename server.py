#!/usr/bin/env python

import web
import json
from session import MongoStore
import conf
import db

jsond = lambda _: json.dumps(_)

urls = (
        '/', 'page',
        '/login', 'login',
        '/logout', 'logout',
        '/tmpl', 'tmpl',
        '/api', 'api_info',
        '/api/(.*)', 'api',
        )

# Turn off debug to use session
web.config.debug = True
app = web.application(urls, globals())
render = web.template.render('templates/')
session = web.session.Session(app, MongoStore(db.db, 'sessions'))

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

class error:
    @staticmethod
    def not_logged_in():
        return jsond({
            'error': 1,
            'desc': 'not logged in'
            })

    @staticmethod
    def api_wrong_action():
        return jsond({
            'error': 1,
            'desc': 'wrong action'
            })

    @staticmethod
    def api_not_implemented():
        return jsond({
            'error': 1,
            'desc': 'API not implemented'
            })

class api_info:
    def GET(self):
        return render.api_info()
        
class api:
    def GET(self, action):
        if action == 'pre_register':
            return error.api_not_implemented()
        elif action == 'register':
            return error.api_not_implemented()
        elif action == 'login':
            return error.api_not_implemented()
        elif action == 'logout':
            session.kill()
            return jsond({ 'success':1 })

        u = session.get('user', None)
        if not u:
            return error.not_logged_in()

        if action == 'stream':
            return jsond([])
        elif action == 'userinfo':
            return jsond(u)
        elif action == 'public':
            return error.api_not_implemented()
        else:
            return error.api_wrong_action()

if __name__ == '__main__':
    app.run()
