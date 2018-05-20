#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Extract a dict mapping xid to text."""

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter, OrderedDict

from bs4 import BeautifulSoup


def clean(x):
    x = re.sub(r'\s+', ' ', x).strip().lower()
    if len(x) > 100:
        return
    return x


def process(filename, args):
    infile = os.path.join(args.indir, filename)
    outfile = os.path.join(args.outdir, re.sub(r'\.html$', '', filename) + '.json')
    if os.path.exists(outfile) and args.no_clobber:
        return

    with open(infile) as fin:
        soup = BeautifulSoup(fin.read(), 'html5lib')
    xid_to_text = OrderedDict()
    for x in soup.body(True):
        if x.get('data-xid'):
            xid = int(x['data-xid'])
            text = clean(x.get_text())
            if text:
                xid_to_text[xid] = text
    with open(outfile, 'w') as fout:
        json.dump(xid_to_text, fout, indent=0, separators=(',', ': '))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--no-clobber', action='store_true')
    parser.add_argument('indir')
    parser.add_argument('outdir')
    args = parser.parse_args()

    for filename in sorted(os.listdir(args.indir)):
        if filename.endswith('.html'):
            print 'Processing {} ...'.format(filename)
            process(filename, args)
    

if __name__ == '__main__':
    main()

