#!/bin/bash
exit 1
################################################################################

curl -d "url=http://google.com" -X POST http://localhost:3333/pages/ | jq '._id'

wget -r --no-parent --no-directories -l 1 http://stanford.edu/~jiangts/research/archived-pages2/ -P data/archived-pages2/
./scripts/convert-allan-html.py data/archived-pages2/ data/archived-pages2-converted/
