#!/bin/bash
exit 1
################################################################################

curl -d "url=http://google.com" -X POST http://localhost:3333/pages/ | jq '._id'
