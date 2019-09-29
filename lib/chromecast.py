#!/usr/bin/env python3

import sys
import json
import time
import pychromecast

DEVICE_NAME='Basement TV'

def testChromecast():
    chromecasts = pychromecast.get_chromecasts()
    cast = next(cc for cc in chromecasts if cc.device.friendly_name == DEVICE_NAME)

    # Start worker thread and wait for cast device to be ready
    cast.wait()
    print(cast.device)
    print(cast.status)

    mc = cast.media_controller
    mc.play_media('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'video/mp4')
    mc.block_until_active()
    print(mc.status)
