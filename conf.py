import pymongo

conn = pymongo.Connection()
db = conn["tao"]

reserved_names = set(["www", "admin", "setting", "settings", ])
