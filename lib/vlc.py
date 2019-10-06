import vlc
from pprint import pprint

class VLCPlayer(object):
    def __init__(self):
        super().__init__()

    def play_file(self, file_name):
        Instance = vlc.Instance()
        player = Instance.media_player_new()
        Media = Instance.media_new(file_name)
        Media.get_mrl()
        player.set_media(Media)

        if sys.platform == "darwin":
            from PyQt4 import QtCore
            from PyQt4 import QtGui
            import sys

            vlcApp =QtGui.QApplication(sys.argv)
            vlcWidget = QtGui.QFrame()
            vlcWidget.resize(700,700)
            vlcWidget.show()
            player.set_nsobject(vlcWidget.winId())

        player.play()