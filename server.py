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
            return render.home()
        else:
            return render.public_home()

class user:
    def GET(self, name):
        if name in conf.reserved_names:
            raise web.notfound()
        else:
            return render.user_page()

class login:
    def GET(self):
        return render.login()

class logout:
    def GET(self):
        session.kill()
        raise web.seeother("/")

class api:
    def GET(self):
        pass


if __name__ == '__main__':
    app.run()
