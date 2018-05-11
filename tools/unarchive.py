#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json, urllib, traceback
from codecs import open
from itertools import izip
from collections import defaultdict, Counter



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--decode', action='store_true')
    parser.add_argument('indir')
    parser.add_argument('outdir')
    args = parser.parse_args()

    if not os.path.exists(args.outdir):
        print 'Creaing directory {}'.format(args.outdir)
        os.makedirs(args.outdir)

    for filename in sorted(os.listdir(args.indir)):
        print 'Processing {}'.format(filename)
        try:
            process(args, os.path.join(args.indir, filename))
        except Exception as e:
            traceback.print_exc()


def process(args, infile):
    basename = os.path.basename(infile)
    outfile = os.path.join(args.outdir, basename)

    with open(infile, 'r', 'utf8') as fin:
        data = re.sub(r'https://motif\.gq/api/archive\?uri=([^&]*)&(amp;)?accessed=\d+', decoder, fin.read(), flags=re.U)
        if args.decode:
            try:
                data = ''.join([chr(ord(x)) for x in data]).decode('utf8')
            except Exception as e:
                print 'Error converting {}'.format(basename)
    with open(outfile, 'w', 'utf8') as fout:
        fout.write(data)


def decoder(match):
    url = urllib.unquote(match.group(1))
    if '.css' in url or '.woff' in url or '.ttf' in url or '.otf' in url:
        # Keep css and fonts
        return match.group(0)
    return url
    

if __name__ == '__main__':
    main()

