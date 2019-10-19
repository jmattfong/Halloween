#!/usr/bin/env python3

from omxplayer.player import OMXPlayer
from pathlib import Path
from time import sleep

VIDEO_PATH = Path("/data/videos/GA_Girl_Roamer1_Win_V.mp4")

player = OMXPlayer(VIDEO_PATH)

sleep(5)

player.quit()
