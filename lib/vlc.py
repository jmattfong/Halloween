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
        self.event_manager = self.vlc_player.event_manager()

        def handle_event(event):
            print("received event")
            pprint(vars(event))
         
        if self.event_manager.event_attach(EventType().MediaPlayerPlaying, handle_event):
            print('event attached successful')
        if self.event_manager.event_attach(EventType().MediaPlayerEndReached, handle_event):
            print('event attached successful end')
        super().__init__()

    def play_file(self, file_name):
        Instance = vlc.Instance('-I macosx')
        player = Instance.media_list_new()
        Media = Instance.media_new(file_name)
        Media.get_mrl()
        player.set_media(Media)
        player.play()
    
    def _play_video(self, file_name, should_loop):
        playback_mode = PlaybackMode.default
        if should_loop:
            self.vlc_player.set_playback_mode(PlaybackMode.repeat)

        Media = self.vlc_instance.media_new(file_name)
        Media.get_mrl()
        self.vlc_player.set_media(Media)
        self.vlc_player.play()

    def play_random_video(self):
        # When time to play spooky video, set repeat to off, ADD spooky video, enqueue black screen video.
        # When spooky video finishes, the black screen should play. Set repeat back to on
        random_vid = '/Users/roryjacob/Desktop/small.mp4'
        blank_video = '/Users/roryjacob/Desktop/2.mp4'

        self.vlc_player.set_playback_mode(PlaybackMode.default)
        media_list = self.vlc_instance.media_list_new()
        random_vid_media = self.vlc_instance.media_new(random_vid) 
        blank_video_media = self.vlc_instance.media_new(blank_video) 
        media_list.add_media(random_vid_media.get_mrl())
        media_list.add_media(blank_video_media.get_mrl())

        self.vlc_player.set_media_list(media_list)
        self.vlc_player.play()


    def _enqueue_video(self, file_name):
        Media = self.vlc_instance.media_list_new(file_name)
        Media.get_mrl()
        self.vlc_player.set_media(Media)
        self.vlc_player.play()

    # def play_random_video(self):
    #     self.play_lock.acquire()
    #     self._play_video(random.choice(VIDEOS))
    #     self.play_lock.release()

    def play_video(self, video):
        self.play_lock.acquire()
        self._play_video(video)
        self.play_lock.release()