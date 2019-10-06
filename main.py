#!/usr/bin/env python3

import sys
import json
import argparse
import lib.chromecast as chromecast
from lib.ring import RingEnhancedSpookinator
from lib.vlc import VLCPlayer
import threading

def main():
    parser = argparse.ArgumentParser(
        description='Let\'s get spooky with some halloween good times.')
    parser.add_argument('--run',
        choices=['chromecast', 'ring', 'vlc', 'all'],
        help='pick if you want to run the chromecast portion or ring. Useful for testing.',
        default='all')
    parser.add_argument('--video-path',
        help='pass it in to test vlc')
    parser.add_argument('--server-url',
        help='the server url where the videos are being served',
        default='https://jmattfong-halloween.s3.us-west-2.amazonaws.com')
    parser.add_argument('--ring-config',
        help='the path to the config where that username and password is',
        default='/var/secret/ring-cred.json')

    args = parser.parse_args()

    # default to using the print_alert method when we are not combining this with actually showing a chromecast video
    random_video_callback = print_alert
    play_video_callback = print_video

    if args.run == 'vlc':
        vlc = VLCPlayer()
        vlc.play_file(args.video_path)

    if args.run == 'chromecast' or args.run == 'all':
        print('Starting chromecast thread')
        chrome_caster = chromecast.ChromecastPlayer(args.server_url)
        random_video_callback = chrome_caster.play_random_video
        play_video_callback = chrome_caster.play_video

        chromecastThread = threading.Thread(target=runChromecast, args=(chrome_caster,))
        chromecastThread.start()

    if args.run == 'ring' or args.run == 'all':
        print('Starting ring thread')
        ringThread = threading.Thread(target=runRing, args=(args.ring_config, random_video_callback,))
        ringThread.start()

    print('Starting input thread')
    inputThread = threading.Thread(target=runCli, args=(play_video_callback,))
    inputThread.start()

def runChromecast(chrome_caster) :
    chrome_caster.play_loop()

def runRing(ring_config, random_video_callback) :
    ring = RingEnhancedSpookinator(ring_config)
    ring.pollForActivity(random_video_callback)

def runCli(play_video_callback) :
    while(True) :
        print()
        print('Select a video to play')
        for index, video in enumerate([video[1] for video in chromecast.ALL_VIDEOS], start=0):
            print(str(index) + ('  - ' if index < 10 else ' - ') + str(video))
        try :
            inputNum = int(input('> '))
            selectedVideo = chromecast.ALL_VIDEOS[inputNum]
            play_video_callback(selectedVideo)
        except:
            print()
            print("That's not a valid number :(")

def print_video(video) :
    print('No chromecast, not playing video: ' + str(video))

def print_alert():
    print('Alert detected! No chromecast')

if __name__== "__main__" :
    main()
