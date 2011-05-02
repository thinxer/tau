Tau is a micro-blogging service.

## installation

Run the following commands:

    git clone git://github.com/thinxer/tau.git
    cd tau
    git submodule update --init
    mv conf_example.py conf.py
    vim conf.py

Depends on: python 2.6+, PIL, pymongo, pyyaml, cssmin.

    pip install pil pymongo pyyaml cssmin


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
