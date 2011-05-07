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

elif conf.text_segmentor == 'zseg':
    import subprocess
    import os.path
    p = subprocess.Popen(os.path.join(os.path.dirname(__file__), 'external/zseg/zseg'),
                         cwd=os.path.join(os.path.dirname(__file__), 'external/zseg'),
                         shell=False,
                         stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE)

    def segment(text):
        if isinstance(text, unicode):
            text = text.encode('utf8')
        global p
        p.stdin.write(' '.join(text.strip().split()) + '\n')
        output = p.stdout.readline().strip()
        return output.decode('utf8').split(' ')

def main():
    print ' '.join(segment('今天天气不错hello world!'))

if __name__ == '__main__':
    main()

