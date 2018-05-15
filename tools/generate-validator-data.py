#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, shutil, re, argparse, json, random
from codecs import open
from itertools import izip
from collections import defaultdict, Counter



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-k', type=int, default=7,
            help='Number of questions per HIT')
    parser.add_argument('-s', '--seed', type=int, default=42)
    parser.add_argument('infile',
            help='Dataset file')
    parser.add_argument('outdir',
            help='Directory to dump the JSON files')
    args = parser.parse_args()

    random.seed(args.seed)
    if not os.path.isdir(args.outdir):
        os.makedirs(args.outdir)
    
    with open(args.infile) as fin:
        data = [json.loads(x) for x in fin]
    
    # Group by web pages
    code_to_examples = defaultdict(list)
    for x in data:
        code = (x['version'], x['webpage'])
        code_to_examples[code].append(x)
    code_and_examples = sorted(code_to_examples.items())

    max_len = 0
    for code, examples in code_and_examples:
        examples.sort(key=lambda x: x['exampleId'])
        random.shuffle(examples)
        max_len = max(max_len, len(examples))
    random.shuffle(code_and_examples)
    print 'Found {} web pages'.format(len(code_to_examples))

    # Group into groups of size k
    i = 0
    for u in xrange(0, max_len, args.k):
        for code, examples in code_and_examples:
            examples = examples[u:u+args.k]
            if len(examples) < args.k:
                continue
            outfile = os.path.join(args.outdir, '{}.json'.format(i))
            with open(outfile, 'w') as fout:
                json.dump({
                    'code': code,
                    'examples': [
                        {'exampldId': x['exampleId'],
                         'phrase': x['phrase'],
                         } for x in examples],
                    }, fout)
                fout.write('\n')
            i += 1
    print 'Generated {} files'.format(i)


if __name__ == '__main__':
    main()

