#!/usr/bin/env python

import sys
import json
import time
import argparse
from lib.chromecast import ChromecastPlayer
from lib.ring import RingEnhancedSpookinator

def main():
    parser = argparse.ArgumentParser(description='Let\'s get spooky with some halloween good times.')
    parser.add_argument('--run', choices=['chromecast', 'ring', 'both'], default='both', 
                        help='pick if you want to run the chromecast portion or ring. Useful for testing.')
    parser.add_argument('--server-url', help='the server url where the videos are being served')
    parser.add_argument('--ring-config', help='the path to the config where that username and password is')

    args = parser.parse_args()

    # default to using the printAlert method when we are not combining this with actually showing a chromecast video
    callback = printAlert

    if args.run == 'chromecast' or args.run == 'both':
        chromeCaster = ChromecastPlayer(args.server_url)
        callback = chromeCaster.playRandomVideo

    if args.run == 'ring' or args.run == 'both':
       ring = RingEnhancedSpookinator(args.ring_config) 
       ring.pollForActivity(callback)

def printAlert():
    print('Alert detected!')

if __name__== "__main__" :
    main()
