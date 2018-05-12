#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter

import tinycss
parser = tinycss.make_parser('page3')

def check(filename):
    try:
        with open(filename, 'r', 'utf8') as fin:
            data = fin.read()
        if data[0] == '<':
            return False
        return True
    except Exception as e:
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('indir')
    parser.add_argument('cssdir')
    args = parser.parse_args()
    
    statuses = {x: True for x in os.listdir(args.indir)}
    for filename in os.listdir(args.cssdir):
        page_name = re.match(r'(.*\.html)-\d+\.css', filename).group(1)
        if not check(os.path.join(args.cssdir, filename)):
            statuses[page_name] = False
    for x in sorted(statuses):
        if not statuses[x]:
            print 'x\t{}'.format(re.sub(r'\.html$', '', x))


if __name__ == '__main__':
    main()

