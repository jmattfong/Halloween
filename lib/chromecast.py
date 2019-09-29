#!/usr/bin/env python3

import sys
import json
import time
import pychromecast
import random
import pprint

DEVICE_NAME='Basement TV'

BLANK_VIDEO=('GA_Buffer_Black_V.mp4', 'Blank Buffer', 10)
BLANK_TIME=BLANK_VIDEO[2]

VIDEOS=[
('GA_Beauty_Roamer1_Win_V.mp4', 'Beckoning Beauty 1', 32),
('GA_Beauty_Roamer2_Win_V.mp4', 'Beckoning Beauty 2', 34),
('GA_Beauty_Roamer3_Win_V.mp4', 'Beckoning Beauty 3', 45),
('GA_Beauty_Roamer4_Win_V.mp4', 'Beckoning Beauty 4', 30),
('GA_Beauty_Startler_Win_V.mp4', 'Beckoning Beauty Startler', 14),
('GA_Girl_Roamer1_Win_V.mp4', 'Ghoulish Girl 1', 29),
('GA_Girl_Roamer2_Win_V.mp4', 'Ghoulish Girl 2', 29),
('GA_Girl_Roamer3_Win_V.mp4', 'Ghoulish Girl 3', 27),
('GA_Girl_Roamer4_Win_V.mp4', 'Ghoulish Girl 4', 33),
('GA_Girl_Startler_Win_V.mp4', 'Ghoulish Girl Startler', 12),
('GA_HeadOfHouse_Roamer1_Win_V.mp4', 'Head of the House 1', 27),
('GA_HeadOfHouse_Roamer2_Win_V.mp4', 'Head of the House 2', 27),
('GA_HeadOfHouse_Roamer3_Win_V.mp4', 'Head of the House 3', 29),
('GA_HeadOfHouse_Roamer4_Win_V.mp4', 'Head of the House 4', 27),
('GA_HeadOfHouse_Startler_Win_V.mp4', 'Head of the House Startler', 12),
('GA_Wraith_Roamer1_Win_V.mp4', 'Wrathful Wraith 1', 25),
('GA_Wraith_Roamer2_Win_V.mp4', 'Wrathful Wraith 2', 24),
('GA_Wraith_Roamer3_Win_V.mp4', 'Wrathful Wraith 3', 25),
('GA_Wraith_Roamer4_Win_V.mp4', 'Wrathful Wraith 4', 23),
('GA_Wraith_Startler_Win_V.mp4', 'Wrathful Wraith Startler', 12)
]

ALL_VIDEOS = [BLANK_VIDEO] + VIDEOS

class ChromecastPlayer(object):

    def __init__(self, server, deviceName=DEVICE_NAME):
        if not server:
            raise "no server url passed in"

        self.server = server
        self.cast = ChromecastPlayer.chromecastConnect(deviceName)
        self.mc = self.cast.media_controller
        self.last_played = ''
        self.next_video = None

        super().__init__()

    def chromecastConnect(deviceName) :
        chromecasts = pychromecast.get_chromecasts()
        #print(chromecasts)
        cast = next(cc for cc in chromecasts if cc.device.friendly_name == deviceName)

        # Start worker thread and wait for cast device to be ready
        cast.wait()

        print()
        print("Connected to chromecast: " + str(cast.device))
        print()

        return cast

    def play_loop(self) :
        while(True) :
            sleep_time = BLANK_TIME
            if self.next_video is None :
                self.play_blank()
            else :
                sleep_time = self.next_video[2]
                self.play_video(self.next_video)
                print('Waiting ' + str(sleep_time) + ' seconds for video to finish')
            self.next_video = None
            time.sleep(sleep_time + 1)

    def queue_random_video(self):
        self.queue_video(random.choice(VIDEOS))

    def queue_video(self, video):
        self.next_video = video
        print('Queued video ' + video[1])

    def play_blank(self) :
        if self.last_played != BLANK_VIDEO[0] :
            print()
            print('Playing blank video')
            print()
        self.play_video(BLANK_VIDEO, logs=False)

    def play_video(self, video, logs=True):
        (videoFile, videoName, videoLength) = video
        videoUrl = (self.server + '/' + videoFile)

        if logs :
            print()
            print("Playing video '" + videoName + "' with url " + str(videoUrl))

        self.mc.play_media(videoUrl, content_type='video/mp4')
        self.mc.block_until_active()
        self.mc.play()
        self.last_played = videoFile

        if logs :
            print("Media State :  " + str(self.mc.status.player_state))
            print()
