import Image

import conf

PHOTO_SIZE = 48

def resize_save(uid, file):
    im = Image.open(file).resize((PHOTO_SIZE, PHOTO_SIZE), Image.ANTIALIAS)
    filename = conf.media_file_path + '/' + uid + '.jpg'
    im.save(filename, 'JPEG')
