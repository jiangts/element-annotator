#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Convert the HTML file produced by Allan
to the format ready for Turking.

- Clean up a few more tags.
- Add "data-xid" to each node.
"""
import sys, os, shutil, re, argparse, json, gzip, traceback
from codecs import open
from itertools import izip
from collections import defaultdict, Counter

from bs4 import BeautifulSoup, Doctype
from HTMLParser import HTMLParser
H = HTMLParser()
from urlparse import urljoin
from urllib import quote


def has_doctype(soup):
    for child in soup.contents:
        if isinstance(child, Doctype):
            return True
    return False


def strip_html(path, i):
    """Strip the HTML: get rid of scripts and interactions"""
    print '[{}] Reading {} ...'.format(i, path)
    with open(path, 'r', 'utf8') as fin:
        # TODO: Handle encodings
        soup = BeautifulSoup(fin.read(), 'html5lib')
    # Add doctype if missing
    if not has_doctype(soup):
        soup.insert(0, Doctype('html'))
    # Remove dangerous tags
    for x in soup('script'):
        x.extract()
    for x in soup('link'):
        if x.get('as') == 'script':
            x.extract()
    for x in soup('iframe'):
        x['src'] = ''
    # Label all tags
    i = 1
    for x in soup.body(True):
        x['data-xid'] = i
        i += 1
    # Return
    return soup.prettify()

def paranoid_quote(url):
    return quote(url, safe='').replace('_', '%5F').replace('%', '_')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('indir',
            help='Directory containing HTML files to convert')
    parser.add_argument('outdir',
            help='An empty directory for dumping the results')
    args = parser.parse_args()

    assert os.path.isdir(args.indir), '{} is not a directory'.format(args.indir)
    assert os.listdir(args.indir), '{} is empty'.format(args.indir)
    if not os.path.exists(args.outdir):
        os.makedirs(args.outdir)
    assert os.path.isdir(args.outdir), '{} is not a directory'.format(args.outdir)
    assert not os.listdir(args.outdir), '{} is not empty'.format(args.outdir)

    filenames = [filename for filename in os.listdir(args.indir)
            if filename.endswith('.html')]
    print 'Found {} web pages'.format(len(filenames))

    for i, filename in enumerate(filenames):
        try:
            in_path = os.path.join(args.indir, filename)
            out_path = os.path.join(args.outdir, filename)
            cleaned = strip_html(in_path, i)
            print 'Dumping to {} ...'.format(out_path)
            with open(out_path, 'w', 'utf8') as fout:
                fout.write(cleaned)
        except Exception as e:
            print 'SOMETHING WRONG HAPPENED for {}'.format(filename)
            traceback.print_exc()


if __name__ == '__main__':
    main()

