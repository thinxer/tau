import Image

import conf

def resize_save(uid, file):
    im = Image.open(file).resize(
            (conf.photo_size, conf.photo_size),
            Image.ANTIALIAS)
    filename = conf.photo_file_path + '/' + uid + conf.photo_ext
    im.save(filename, conf.photo_type)
