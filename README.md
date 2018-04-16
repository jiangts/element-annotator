# Data Collection

Phrase-Node data collection process:

## Step 1: Save web pages

- `tools/extension`: Use Allan's Chrome extension to save web pages
  - (TODO: More details on how to use)
  - In the background, Allan's server saves all resources

## Step 2: Sanitize web pages

- `tools/convert-allan-html.py`: Batch sanitize the web pages
  - The script removes dangerous tags (`script`, `iframe`, etc.)
  - The script also adds a unique `data-xid` attribute to each tag
- `tools/page-filter`: View the page and remove bad pages
  - Start the server `tools/page-filter/server.py`, specifying a file to dump bad URLs.
  - Start another simple server with [`http-server`](https://www.npmjs.com/package/http-server)
    to serve static files in that directory at `http://127.0.0.1:8080`.
  - Go to `http://127.0.0.1:8080`.
    - Click on the web page to view it.
    - If it's bad, click X. The URL will be dumped to the bad URL file,
      and will not show up next time you open the interface.
- `tools/batch-copy-files.py`: Copy the good pages to `public/pages/`

## Step 3: Put on Mechanical Turk

- Copy the content of `public/` to a static file server (e.g., `jamie:~/www/mturk/`)
- (Ice) Use the `mturk-api` tool in the `webrep` repo to launch tasks + parse data

## Step 4: Render in Selenium

- In parallel to Step 3, render pages in Selenium to get the geometries of the nodes.
  - Start a simple server in the `public/pages/` directory (say at `http://127.0.0.1:8080`)
  - Dump the list of URLs (e.g., `http://127.0.0.1:8000/google.com.html`) to some file (e.g., `/tmp/url-list`)
  - Run
    `./webrep/downloader/download.py -i /tmp/url-list -o /tmp/output-dir/ -a -H -r`
    - This will generate `info` JSON files to `/tmp/output-dir/`

## Step 5: Package into dataset

- Put the pages (from Step 2), Turked data (from Step 3), and `info` files (from Step 4)
  into the same place
  - Right now they are saved at `jamie:/u/scr/ppasupat/data/webrep/phrase-node-dataset/`
