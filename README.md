Tau is a micro-blogging service.

## installation

Run the following commands:

    git clone git://github.com/thinxer/tau.git
    cd tau
    git submodule update --init
    mv conf_example.py conf.py
    vim conf.py
    i18n/makejs.py zh_CN

Depends on: python 2.6+, PIL, pymongo, pyyaml, cssmin.

    pip install pil pymongo pyyaml cssmin

## search

To use search, set enable\_search=True in conf.py. You'll also need to specify a text segmentor, such as 'pymmseg'.

To use pymmseg, you need to compile it:

    cd pymmseg/mmseg-cpp
    python2 build.py

## debug mode

Just need to run server.py.

    python2 server.py


## deployment

As web.py is a wsgi compatible framework, you can deploy it into any wsgi
container. We use nginx and uwsgi in production.

You need a working uwsgi program. Get it from: http://projects.unbit.it/uwsgi/.

Here are some sample scripts:

start:

    uwsgi -s /tmp/tau-prod.socket -w server --pidfile /tmp/tau-prod.pid -M

stop:

    kill -SIGINT `cat /tmp/tau-prod.pid'

reload:

    kill -SIGHUP `cat /tmp/tau-prod.pid'

nginx config:

    location / {
        include uwsgi_params;
        uwsgi_pass unix:/tmp/tau-prod.socket;
    }

    location /static/ {
        root /path/to/tau/;
        if ($query_string) {
            expires max;
        }
    }

## translation

Please refer to i18n/README for details.
For short:

    cd i18n
    ./update zh_CN

and fill in the blanks as prompted.
