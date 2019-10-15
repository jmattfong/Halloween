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
        def handle_event(event, two, three):
            print("received event")
            pprint(vars(event))
            print(f'first param: {event}\n second param: {two}\n third param: {three}\n')
        
        event_manager = self.vlc_player.event_manager()

        # just add all the events
        for event_id in EventType._enum_names_.keys():
            event = EventType(event_id)
            print(f'Adding handler for event type {event}')
            result = self.vlc_player.event_manager().event_attach(event, handle_event, "type", str(event))
            print(f'{event} attached result: ' + str(result))
         
        # result = self.vlc_player.event_manager().event_attach(EventType().MediaPlayerPlaying, handle_event, "type", "playing")
        # print('play event attached result: ' + str(result))

        # result = self.vlc_player.event_manager().event_attach(EventType().MediaPlayerEndReached, handle_event, "type", "end")
        # print('end reached event attached result: ' + str(result))

        # result = self.vlc_player.event_manager().event_attach(EventType().MediaListItemAdded, handle_event, "type", "list added")
        # print('list item added event attached result: ' + str(result))

        # result = self.vlc_player.event_manager().event_attach(EventType().MediaListPlayerPlayed, handle_event, "type", "list player played")
        # print('list player played event attached result: ' + str(result))

        # result = self.vlc_player.event_manager().event_attach(EventType().MediaListPlayerStopped, handle_event, "type", "list player stopped")
        # print('list player stopped event attached result: ' + str(result))

        # result = self.vlc_player.event_manager().event_attach(EventType().MediaListEndReached, handle_event, "type", "list player end reached")
        # print('list player end reached event attached result: ' + str(result))

        # result = self.vlc_player.event_manager().event_attach(EventType().MediaListViewItemAdded, handle_event, "type", "list view item added")
        # print('list player end reached event attached result: ' + str(result))

        # result = self.vlc_player.event_manager().event_attach(EventType().MediaListEndReached, handle_event, "type", "list player end reached")
        # print('list player end reached event attached result: ' + str(result))

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