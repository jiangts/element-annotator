#!/bin/bash
exit 1
################################################################################

# Run the conversion script on the pages
wget -r --no-parent --no-directories -l 1 http://stanford.edu/~jiangts/research/archived-pages2/ -P data/archived-pages2/
./tools/convert-allan-html.py data/archived-pages2/ data/archived-pages2-converted/
./tools/convert-allan-html.py data/archived-pages3/ data/archived-pages3-converted/

# Copy stuff
./tools/batch-copy-files.py -g data/v5-unarc-mark data/v5-unarc-pages data/v5-out-pages/
./tools/batch-copy-files.py -g data/v5-unarc-mark data/v5-unarc-css data/v5-out-css/
rsync -avzuLi --exclude=pages-css data/v5-out-pages/ jamie:~/www/mturk/element-annotator-v8/pages/
rsync -avzuLi data/v5-out-css/ jamie:~/www/mturk/element-annotator-v8/pages-css/ 

# Node-text (for giving bonuses)
./tools/extract-node-texts.py data/v5-downloaded-pages-unarchived/ data/v5-out-node-texts/
rsync -avzuLi data/v5-out-node-texts fandango:~/Private/webrep/turk-api/data/5a/

# Info file
cd data/v5-out-pages/ && ls --color=none | grep '\.html$' | sed 's_^_http://127.0.0.1:8080/_' > ~/Private/webrep/data/tmp/v5-pages
