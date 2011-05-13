import Image

import conf

def getHue(im):
    hist = im.histogram()

    r = hist[0:256]
    g = hist[256:512]
    b = hist[512:768]

    def avg(x):
        s = 0
        for i in range(len(x)):
            s += i * x[i]
        a = s / sum(x)
        w = int(a * 0.5 + 255 * 0.5)
        if w > 0xf5:
            w = 0xf5
        return w

    return "#{0:02x}{1:02x}{2:02x}".format(*map(avg, [r, g, b]))

def process(uid, file):
    im = Image.open(file).resize(
            (conf.photo_size, conf.photo_size),
            Image.ANTIALIAS)
    im = im.convert('RGB')
    filename = conf.photo_file_path + '/' + uid + conf.photo_ext
    im.save(filename, conf.photo_type)
    return {
            'hue': getHue(im)
            }
