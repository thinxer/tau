db_name = "tau"
secret = "PUT YOUR SERVER SECRET HERE"
version = '1'

reserved_names = set(["www", "admin", "setting", "settings", \
        "login", "logout", "api"])

photo_uri_prefix = '/static/photos/'
default_photo_uri = '/static/photos/_.png'
import os.path
photo_file_path = os.path.join(os.path.dirname(__file__), "static/photos")
photo_size = 60
photo_type = 'JPEG'
photo_ext = '.jpg'

# max stream item number in a query
stream_item_max = 50

debug = True
