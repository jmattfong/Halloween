#!/usr/bin/env python3

import sys
import json
import time
import pychromecast

DEVICE_NAME='Basement TV'

def main():
    videoFile = sys.argv[1]
    cast = chromecastConnect()
    playVideo(cast, videoFile)

def chromecastConnect(deviceName=DEVICE_NAME) :
    chromecasts = pychromecast.get_chromecasts()
    cast = next(cc for cc in chromecasts if cc.device.friendly_name == deviceName)

    # Start worker thread and wait for cast device to be ready
    cast.wait()

    print("Connected to chromecast: " + str(cast.device))
    print()
    print("Chromecast Status: " + str(cast.status))
    print()

    return cast

def playVideo(cast, videoFile):
    print("Playing video " + str(videoFile))
    print()

    mc = cast.media_controller
    mc.play_media(videoFile, content_type='video/mp4')
    mc.block_until_active()
    mc.play()

    print("Chromecast media status :  " + str(mc.status))
    print()

if __name__== "__main__" :
    main()
