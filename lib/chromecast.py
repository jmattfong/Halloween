#!/usr/bin/env python3

import sys
import json
import time
import pychromecast
import random

DEVICE_NAME='Basement TV'

VIDEOS=[
'GA_Beauty_Roamer1_Win_V.mp4',
'GA_Beauty_Roamer2_Win_V.mp4',
'GA_Beauty_Roamer3_Win_V.mp4',
'GA_Beauty_Roamer4_Win_V.mp4',
'GA_Beauty_Startler_Win_V.mp4',
'GA_Buffer_Black_V.mp4',
'GA_Girl_Roamer1_Win_V.mp4',
'GA_Girl_Roamer2_Win_V.mp4',
'GA_Girl_Roamer3_Win_V.mp4',
'GA_Girl_Roamer4_Win_V.mp4',
'GA_Girl_Startler_Win_V.mp4',
'GA_HeadOfHouse_Roamer1_Win_V.mp4',
'GA_HeadOfHouse_Roamer2_Win_V.mp4',
'GA_HeadOfHouse_Roamer3_Win_V.mp4',
'GA_HeadOfHouse_Roamer4_Win_V.mp4',
'GA_HeadOfHouse_Startler_Win_V.mp4',
'GA_Wraith_Roamer1_Win_V.mp4',
'GA_Wraith_Roamer2_Win_V.mp4',
'GA_Wraith_Roamer3_Win_V.mp4',
'GA_Wraith_Roamer4_Win_V.mp4',
'GA_Wraith_Startler_Win_V.mp4'
]

def main():
    server = sys.argv[1]
    cast = chromecastConnect()
    playRandomVideo(cast, server)

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

def playRandomVideo(cast, server):
    video = random.choice(VIDEOS)
    playVideo(cast, server, video)

def playVideo(cast, server, videoFile):
    videoUrl = (server + '/' + videoFile)
    print("Playing video " + str(videoUrl))
    print()

    mc = cast.media_controller
    mc.play_media(videoUrl, content_type='video/mp4')
    mc.block_until_active()
    mc.play()

    print("Chromecast media status :  " + str(mc.status))
    print()

if __name__== "__main__" :
    main()
