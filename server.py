#!/usr/bin/env python

import web
import json
from session import MongoStore
import conf

db = conf.db
users = db.users

urls = (
        '/', 'home',
        '/login', 'login',
        '/logout', 'logout',
        '/about', 'about',
        '/api', 'api',
        )

# Turn off debug to use session
web.config.debug = True
app = web.application(urls, globals())
render = web.template.render('templates/')
session = web.session.Session(app, MongoStore(db, 'sessions'))

class home:
    def GET(self):
        logged_in = True
        if logged_in:
            return render.page('Tau', ['test.css'], [('k', 'v')], ['home.js'])
        else:
            return render.page('Tau', [], [], [])

class user:
    def GET(self, name):
        if name in conf.reserved_names:
            raise web.notfound()
        else:
            return render.page('Username', [], [], [])

class login:
    def GET(self):
        return render.page('Login', [], [], [])

class logout:
    def GET(self):
        session.kill()
        raise web.seeother("/")

class about:
    def GET(self):
        return render.page('About Tau', [], [], [])

class api:
    def GET(self):
        pass

if __name__ == '__main__':
    app.run()
