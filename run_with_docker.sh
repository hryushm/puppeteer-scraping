#!/bin/bash

ROOTDIR=$(cd $(dirname $0) ;pwd)
cd $ROOTDIR

docker run -i --rm --cap-add=SYS_ADMIN \
--name puppeteer-chrome puppeteer-chrome-linux \
node -e "`cat index.js`"