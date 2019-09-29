#!/usr/bin/env python

import sys
import json
import time
import argparse
from lib.chromecast import testChromecast
from lib.ring import doRing

def main():
    parser = argparse.ArgumentParser(description='Let\'s get spooky with some halloween good times.')
    parser.add_argument('--run', choices=['chromecast', 'ring', 'both'], default='all', 
                        help='pick if you want to run the chromecast portion or ring. Useful for testing.')
    parser.add_argument('ringConfigPath',
                        help='the path to the config where that username and password is')

    args = parser.parse_args()

    if args.run == 'chromecast' or args.run == 'both':
        testChromecast()

    if args.run == 'ring' or args.run == 'both':
        if args.ringConfigPath == '':
            raise 'no config path passed'
        doRing(args.ringConfigPath)


if __name__== "__main__" :
    main()
