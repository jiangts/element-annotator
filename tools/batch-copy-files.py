#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter

def check(filename, good_urls):
    if good_urls is None:
        return True
    if filename.endswith('.html'):
        m = re.match(r'(.*)\.html$', filename)
        if m and m.group(1) in good_urls:
            return True
    elif filename.endswith('.css'):
        m = re.match(r'(.*)\.html-\d+\.css$', filename)
        if m and m.group(1) in good_urls:
            return True
    return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-g', '--good-urls')
    parser.add_argument('src_dir')
    parser.add_argument('tgt_dir')
    args = parser.parse_args()

    if args.good_urls:
        with open(args.good_urls, 'r') as fin:
            good_urls = set()
            for line in fin:
                mark, url = line.strip().split('\t')
                if mark == 'o':
                    good_urls.add(url)
    else:
        good_urls = None
    print good_urls

    for filename in sorted(os.listdir(args.src_dir)):
        if check(filename, good_urls):
            src = os.path.join(args.src_dir, filename)
            tgt = os.path.join(args.tgt_dir, filename)
            print src, '-->', tgt
            shutil.copy(src, tgt)
        else:
            pass
            #print 'SKIP', os.path.join(args.src_dir, filename)
    

if __name__ == '__main__':
    main()

