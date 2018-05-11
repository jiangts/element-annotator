#!/bin/bash
exit 1
################################################################################

# Run the conversion script on the pages
wget -r --no-parent --no-directories -l 1 http://stanford.edu/~jiangts/research/archived-pages2/ -P data/archived-pages2/
./tools/convert-allan-html.py data/archived-pages2/ data/archived-pages2-converted/
./tools/convert-allan-html.py data/archived-pages3/ data/archived-pages3-converted/

# Copy stuff
./tools/batch-copy-files.py -g data/v5-mark-unarchived data/v5-downloaded-pages-unarchived/ data/v5-out-pages/
./tools/batch-copy-files.py -g data/v5-mark-unarchived data/v5-downloaded-css-unarchived/ data/v5-out-css/
rsync -avzuLi data/v5-out-pages/ jamie:~/www/mturk/element-annotator-v8/pages/ 
rsync -avzuLi data/v5-out-css/ jamie:~/www/mturk/element-annotator-v8/pages-css/ 
