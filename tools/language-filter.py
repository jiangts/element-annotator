#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter


from bs4 import BeautifulSoup, Doctype



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('indir')
    parser.add_argument('vocab')
    args = parser.parse_args()

    with open(args.vocab) as fin:
        vocab = set(x.strip() for x in fin)
    for filename in sorted(os.listdir(args.indir)):
        with open(os.path.join(args.indir, filename)) as fin:
            soup = BeautifulSoup(fin.read(), 'html5lib')
        words = soup.get_text().lower().split()
        num_words = max(1, len(words))
        num_english_words = sum(x in vocab for x in words)
        print '{:.3f}\t{}'.format(num_english_words * 100. / num_words, filename)
    

if __name__ == '__main__':
    main()

