#!/bin/bash
exit 1
################################################################################

# Run the conversion script on the pages
wget -r --no-parent --no-directories -l 1 http://stanford.edu/~jiangts/research/archived-pages2/ -P data/archived-pages2/
./scripts/convert-allan-html.py data/archived-pages2/ data/archived-pages2-converted/

# Run the conversion script on the pages
./scripts/convert-allan-html.py data/archived-pages3/ data/archived-pages3-converted/
