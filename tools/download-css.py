#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
import time, urllib, logging, traceback
from codecs import open
from itertools import izip
from collections import defaultdict, Counter

from bs4 import BeautifulSoup
import requests




def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('indir')    
    parser.add_argument('outdir')
    args = parser.parse_args()

    for filename in sorted(os.listdir(args.indir)):
        print 'Processing {}'.format(filename)
        try:
            process(args, os.path.join(args.indir, filename))
        except Exception as e:
            traceback.print_exc()


def process(args, infile):
    basename = os.path.basename(infile)
    out_prefix = os.path.join(args.outdir, basename)
    assert not os.path.exists(out_prefix)

    with open(infile, 'r', 'utf8') as fin:
        soup = BeautifulSoup(fin.read(), 'html5lib')

    i = 0
    for x in soup('link'):
        href = x.get('href')
        if href and href.startswith('https://motif.gq/'):
            print 'Downloading {}'.format(href)
            x['href'] = 'pages-css/{}-{}.css'.format(basename, i)
            with open('{}-{}.css'.format(out_prefix, i), 'w', 'utf8') as fout:
                fout.write(requests.get(href).text)
            i += 1

    with open(out_prefix, 'w', 'utf8') as fout:
        fout.write(soup.prettify())
    

if __name__ == '__main__':
    main()

