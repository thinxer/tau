# -*- coding: utf8 -*-

import conf

if conf.text_segmentor == 'pymmseg':
    from pymmseg import mmseg
    mmseg.dict_load_defaults()

    def segment(text):
        '''
        text should be either utf8 or unicode
        return a list of words in unicode
        '''

        if isinstance(text, unicode):
            text = text.encode('utf8')
        alg = mmseg.Algorithm(text)
        # print '%s [%d..%d]' % (tok.text, tok.start, tok.end) for tok in alg
        return [tok.text.decode('utf8') for tok in alg]

def main():
    print segment('今天天气不错hello world!')

if __name__ == '__main__':
    main()

