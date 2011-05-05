db_name = "tau"
secret = "PUT YOUR SERVER SECRET HERE"
version = '1'
locale = 'zh_CN'

enable_search = False
text_segmentor = 'pymmseg'

# possible values: mongo, memcache.
session_type = 'memcache'
session_timeout = 7*24*60*60    # for a week, in seconds
session_memcache_servers = ['127.0.0.1:11211']

reserved_names = set(["www", "admin", "setting", "settings", \
        "login", "logout", "api"])

photo_uri_prefix = '/static/photo/'
default_photo_uri = '/static/photo/_.png'
import os.path
photo_file_path = os.path.join(os.path.dirname(__file__), "static/photo")
photo_size = 60
photo_type = 'JPEG'
photo_ext = '.jpg'

# max stream item number in a query
stream_item_max = 50

debug = True
