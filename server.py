#!/usr/bin/env python

import web
import json
from session import MongoStore
import conf
import db
import error

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

class api_info:
    def GET(self):
        return render.api_info()
        
class api:
    ACTIONS = set('register login logout stream userinfo publish'.split(' '))
    def GET(self, action):
        if action not in self.ACTIONS:
            return error.wrong_action()
        i = web.input()
        if action == 'register':
            return error.not_implemented()
        elif action == 'login':
            return error.not_implemented()
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

        return error.not_implemented()

if __name__ == '__main__':
    app.run()
