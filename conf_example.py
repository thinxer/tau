db_name = "tau"

reserved_names = set(["www", "admin", "setting", "settings", \
        "login", "logout", "api"])

media_uri_prefix = '/static/photos/'
import os.path
media_file_path = os.path.join(os.path.dirname(__file__), "static/photos")
