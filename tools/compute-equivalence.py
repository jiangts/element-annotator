#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter

from bs4 import BeautifulSoup, Tag


def get_equivalences(soup, xid):
    node = soup.find(attrs={'data-xid': xid})
    equivs = []
    for x in node.descendants:
        if isinstance(x, Tag) and 'data-xid' in x.attrs:
            equivs.append(int(x.attrs['data-xid']))
    return equivs

def compute(answer_json, web_page):
    with open(answer_json, 'r', 'utf8') as fin:
        data = json.load(fin)

    with open(web_page, 'r', 'utf8') as fin:
        soup = BeautifulSoup(fin.read(), 'html5lib')

    for datum in data:
        # datum contains "xid" and "answers"
        xid = datum['xid']
        equivs = get_equivalences(soup, xid)
        datum['answers'] = [{'type': 'equiv', 'xid': e} for e in equivs] + datum['answers']
    return data

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('answer_json_basedir')
    parser.add_argument('web_page_basedir')
    parser.add_argument('outdir')
    args = parser.parse_args()

    if not os.path.exists(args.outdir):
        os.makedirs(args.outdir)

    answer_jsons = [re.match(r'ans-(.*)\.json$', x).group(1)
            for x in os.listdir(args.answer_json_basedir) if x.endswith('.json')]
    for x in answer_jsons:
        answer_json = os.path.join(args.answer_json_basedir, 'ans-{}.json'.format(x))
        web_page = os.path.join(args.web_page_basedir, '{}.html'.format(x))
        new_data = compute(answer_json, web_page)
        with open(os.path.join(args.outdir, 'ans-{}.json'.format(x)), 'w') as fout:
            json.dump(new_data, fout)


if __name__ == '__main__':
    main()

