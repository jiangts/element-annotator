#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter
import gzip

from bottle import Bottle, request, response, static_file
app = Bottle()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

################################

args = None

@app.hook('after_request')
def enable_cors():
    # This is dangerous but whatever:
    response.headers['Access-Control-Allow-Origin'] = '*'

@app.get('/list')
def list_files():
    marks = {}
    with open(args.mark_filename) as fin:
        for line in fin:
            mark, filename = line.strip().split('\t')
            marks[filename] = mark
    # List of (filename, mark)
    file_list = []
    for filename in os.listdir(args.basedir):
        if not filename.endswith('.html'):
            continue
        filename = re.sub(r'\.html$', '', filename)
        file_list.append((filename, marks.get(filename, '')))
    file_list.sort()
    # Write back to file
    shutil.copy(args.mark_filename, args.mark_filename + '.bak')
    with open(args.mark_filename, 'w') as fout:
        for filename, mark in file_list:
            if mark:
                print >> fout, '{}\t{}'.format(mark, filename)
    return {
        'filenames': file_list,
        }

@app.get('/view')
def view():
    filename = request.query.filename
    with open(os.path.join(args.basedir, filename + '.html')) as fin:
        return fin.read()


@app.post('/mark')
def post_mark():
    filename = request.forms.filename
    mark = request.forms.mark
    assert mark in ('o', 'x')
    with open(args.mark_filename, 'a') as fout:
        print >> fout, '{}\t{}'.format(mark, filename)
    return 'Marked {} as {}'.format(filename, mark)

@app.get(r'/static/<filename:re:viewer.*|jquery.min.js>')
def get_static(filename):
    return static_file(filename, root=SCRIPT_DIR)

@app.get(r'/static/pages-css/<filename:re:.*\.html-\d+\.css>')
def get_css(filename):
    return static_file(filename, root=args.css_dir)



################################################

def main():
    global args
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', default=8032,
            help='Open the connection at this port')
    parser.add_argument('-g', '--global-access', action='store_true',
            help='Allow global access to the server')
    parser.add_argument('basedir',
            help='Storage base directory')
    parser.add_argument('-c', '--css-dir')
    parser.add_argument('mark_filename',
            help='File containing marked filenames')
    args = parser.parse_args()

    # Start the server
    host = 'localhost' if not args.global_access else '0.0.0.0'
    app.run(host=host, port=args.port)
    print '\nGood bye!'
    

if __name__ == '__main__':
    main()
