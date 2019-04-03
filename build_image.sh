#!/bin/bash

ROOTDIR=$(cd $(dirname $0) ;pwd)
cd $ROOTDIR

docker build -t puppeteer-chrome-linux .