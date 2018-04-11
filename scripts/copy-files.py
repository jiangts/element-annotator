#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-b', '--bad-urls')
    parser.add_argument('src_dir')
    parser.add_argument('tgt_dir')
    args = parser.parse_args()

    if args.bad_urls:
        with open(args.bad_urls, 'r') as fin:
            bad_urls = set(x.strip() + '.html' for x in fin)

    for filename in sorted(os.listdir(args.src_dir)):
        if filename.endswith('.html') and filename not in bad_urls:
            src = os.path.join(args.src_dir, filename)
            tgt = os.path.join(args.tgt_dir, filename)
            print src, '-->', tgt
            shutil.copy(src, tgt)
        else:
            print 'SKIP', os.path.join(args.src_dir, filename)
    

if __name__ == '__main__':
    main()

