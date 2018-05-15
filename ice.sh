#!/bin/bash
exit 1
################################################################################

# Run the conversion script on the pages
wget -r --no-parent --no-directories -l 1 http://stanford.edu/~jiangts/research/archived-pages2/ -P data/archived-pages2/
./tools/convert-allan-html.py data/archived-pages2/ data/archived-pages2-converted/
./tools/convert-allan-html.py data/archived-pages3/ data/archived-pages3-converted/

# Copy to turk directory
./tools/batch-copy-files.py -g data/v5-unarc-mark data/v5-unarc-pages data/v5-out-pages/
./tools/batch-copy-files.py -g data/v5-unarc-mark data/v5-unarc-css data/v5-out-css/
rsync -avzuLi --exclude=pages-css data/v5-out-pages/ jamie:~/www/mturk/element-annotator-v8/pages/
rsync -avzuLi data/v5-out-css/ jamie:~/www/mturk/element-annotator-v8/pages-css/ 
cd data/v5-out-pages; ls *.html --color=none | sed 's/\.html$//' > /tmp/uguu; rsync -avzuLi /tmp/uguu fandango:/tmp/

# Node-text (for giving bonuses)
./tools/extract-node-texts.py data/v5-unarc-pages/ data/v5-node-texts/
rsync -avzuLi data/v5-node-texts fandango:~/Private/webrep/turk-api/data/misc/

# Info file for the download script
cd data/v5-out-pages/ && ls --color=none | grep '\.html$' | sed 's_^_http://127.0.0.1:8080/_' > ~/Private/webrep/data/tmp/v5-pages

# Copy to the dataset directory on jamie
rsync -avzuLi data/v5-out-pages/ jamie:/u/scr/ppasupat/data/webrep/phrase-node-dataset/pages/v5/

# Validator
./tools/generate-validator-data.py ~/Private/webrep/data/phrase-node-dataset/data/combined-v2.dev.jsonl data/validate-jsons/
rsync -avzuLi --exclude='pages*' public/ jamie:~/www/mturk/element-annotator-validator/
