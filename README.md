# Halloween

## How To Run

### Testing chromecast
```python
python3 main.py --run chromecast --server-url <endpoint>
```

### Testing ring
```python
python3 main.py --run ring --ring-config path/to/ring/config
```

### Testing both!
```python
python3 main.py --ring-config path/to/ring/config --server-url <endpoint>
```

## VLC Stuff
To test the vlc stuff on mac, I have been running some test commands from my terminal. You can start VLC with a screen + terminal to talk to it with the following command:
```bash
/Applications/VLC.app/Contents/MacOS/VLC -I macosx --extraintf rc
```

That will open up a screen. Type ```help``` in the terminal. Some examples:

```
to play a video right now:
play file:///Users/roryjacob/Desktop/small.mp4

to queue a video to play after the current video finishes:
queue file:///Users/roryjacob/Desktop/2.mp4

to repeat the current playing video:
repeat on

to loop a playlist
loop on
```
