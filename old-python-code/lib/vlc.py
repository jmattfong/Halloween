import vlc
from vlc import PlaybackMode, EventType
from pprint import pprint

# I think, after messing with the cli, we will have to do this:
# start black screen video, set repeat to on
# When time to play spooky video, set repeat to off, ADD spooky video, enqueue black screen video.
# When spooky video finishes, the black screen should play. Set repeat back to on
class VLCPlayer(object):
    def __init__(self):
        self.vlc_instance = vlc.Instance()
        self.vlc_player = self.vlc_instance.media_list_player_new()
        def handle_event(event):
            print(f'received event: {event}')
            if event.type == EventType().MediaListPlayerPlayed:
                # this means that the play list has finished playing. We should start looping the blank video now
                self._loop_blank_video()
            else:
                print(f'event type {event.type} is unhandled')
        
        # using some debugging skills, it looks like the following events occur with the current media list setup:
        # 1. MediaListPlayerNextItemSet: invoked at the start of a media list item being played (Not needed?)
        # 2. MediaListPlayerPlayed: invoked when the list has played all videos in it
        for event in [EventType().MediaListPlayerPlayed]:
            print(f'Adding handler for event type {event}')
            result = self.vlc_player.event_manager().event_attach(event, handle_event)
            print(f'{event} attached result: ' + str(result))

        super().__init__()

    def _loop_blank_video(self):
        """
        loop_blank_video starts the looping of the blank video. This is done with the follow order of operations:
        1. Create a new playlist (or use maybe its already created?) with just the blank video
        2. Set the VLC playback mode to Repeat
        3. Set the media list to the blank video list
        4. Play
        """
        print('starting to play blank video loop here')
        media_list = self.vlc_instance.media_list_new()
        print('line 2')
        blank_video = '/Users/roryjacob/Desktop/small.mp4'
        blank_video_media = self.vlc_instance.media_new(blank_video) 
        print('line 3')
        media_list.add_media(blank_video_media.get_mrl())
        print('line 4')
        # this is broken here. Most likely we can only create a single media list per-instance. Probably we will have to also
        # track this here
        result = self.vlc_player.set_media_list(media_list)
        print('line 5')
        self.vlc_player.play()
        print('line 6')
        self.vlc_player.set_playback_mode(PlaybackMode.repeat)
        print('line 7')
    
    def play_random_video(self):
        # When time to play spooky video, set repeat to off, ADD spooky video, enqueue black screen video.
        # When spooky video finishes, the black screen should play. Set repeat back to on
        random_vid = '/Users/roryjacob/Desktop/small.mp4'
        blank_video = '/Users/roryjacob/Desktop/small.mp4'
        # blank_video = '/Users/roryjacob/Desktop/2.mp4'

        self.vlc_player.set_playback_mode(PlaybackMode.default)
        media_list = self.vlc_instance.media_list_new()
        random_vid_media = self.vlc_instance.media_new(random_vid) 
        blank_video_media = self.vlc_instance.media_new(blank_video) 
        media_list.add_media(random_vid_media.get_mrl())
        media_list.add_media(blank_video_media.get_mrl())

        self.vlc_player.set_media_list(media_list)
        self.vlc_player.play()
