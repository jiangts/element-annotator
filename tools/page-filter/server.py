#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys, os, shutil, re, argparse, json
from codecs import open
from itertools import izip
from collections import defaultdict, Counter
import gzip

from bottle import Bottle, request, response, static_file
app = Bottle()

################################

args = None

@app.hook('after_request')
def enable_cors():
    # This is dangerous but whatever:
    response.headers['Access-Control-Allow-Origin'] = '*'

@app.get('/list')
def list_files():
    with open(args.bad_filenames) as fin:
        init_bad_filenames = set(x.strip() for x in fin)
    file_list = []
    for filename in os.listdir(args.basedir):
        filename = re.sub(r'\.html$', '', filename)
        if filename not in init_bad_filenames:
            file_list.append(filename)
    file_list.sort()
    return {
        'filenames': file_list,
        }

@app.get('/view')
def view():
    filename = request.query.filename
    with open(os.path.join(args.basedir, filename + '.html')) as fin:
        return fin.read()

@app.post('/bad')
def bad():
    filename = request.forms.filename
    with open(args.bad_filenames, 'a') as fout:
        print >> fout, filename
    return 'Removed {}'.format(filename)

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
    parser.add_argument('bad_filenames',
            help='File containing bad filenames')
    args = parser.parse_args()

    # Start the server
    host = 'localhost' if not args.global_access else '0.0.0.0'
    app.run(host=host, port=args.port)
    print '\nGood bye!'
    

if __name__ == '__main__':
    main()
