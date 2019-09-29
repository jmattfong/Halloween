#!/usr/bin/env python

import sys
import json
import time
import argparse
import lib.chromecast as cc
from lib.ring import RingEnhancedSpookinator

MAIN_VIDEO = "GA_Beauty_Startler_Holl_V.mp4"

def main():
    parser = argparse.ArgumentParser(description='Let\'s get spooky with some halloween good times.')
    parser.add_argument('--run', choices=['server', 'ring', 'both'], default='all', 
                        help='pick if you want to run the chromecast portion or ring. Useful for testing.')
    parser.add_argument('--videoServer')
    parser.add_argument('ringConfigPath',
                        help='the path to the config where that username and password is')

    args = parser.parse_args()

    # default to using the printAlert method when we are not combining this with actually showing a chromecast video
    callback = printAlert

    if args.run == 'server' or args.run == 'both':
        videoServer = args.videoServer
        server(videoServer)

    if args.run == 'ring' or args.run == 'both':
       ring = RingEnhancedSpookinator(args.ringConfigPath) 
       ring.pollForActivity(callback)

def server(videoServer) :
    cast = cc.chromecastConnect()
    cc.playVideo(cast, videoServer, MAIN_VIDEO)

def printAlert():
    print('Alert detected!')

if __name__== "__main__" :
    main()
