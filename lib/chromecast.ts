var Client                = require('castv2-client').Client;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
var mdns                  = require('mdns');

class Video {
    private fileName: string
    private name: string
    private videoLengthSeconds: number

    constructor(fileName: string, name: string, videoLengthSeconds: number) {
        this.fileName = fileName;
        this.name = name;
        this.videoLengthSeconds = videoLengthSeconds;
    }

    public getFileName(): string {
        return this.fileName;
    }
    public getName(): string {
        return this.name;
    }
    public getVideoLengthSeconds(): number {
        return this.videoLengthSeconds;
    }
}

let BLANK_VIDEO = new Video('GA_Buffer_Black_V.mp4', 'Blank Buffer', 10);

let VIDEOS = [
    new Video('GA_Beauty_Roamer1_Win_V.mp4', 'Beckoning Beauty 1', 32),
    new Video('GA_Beauty_Roamer2_Win_V.mp4', 'Beckoning Beauty 2', 34),
    new Video('GA_Beauty_Roamer3_Win_V.mp4', 'Beckoning Beauty 3', 45),
    new Video('GA_Beauty_Roamer4_Win_V.mp4', 'Beckoning Beauty 4', 30),
    new Video('GA_Beauty_Startler_Win_V.mp4', 'Beckoning Beauty Startler', 14),
    new Video('GA_Girl_Roamer1_Win_V.mp4', 'Ghoulish Girl 1', 29),
    new Video('GA_Girl_Roamer2_Win_V.mp4', 'Ghoulish Girl 2', 29),
    new Video('GA_Girl_Roamer3_Win_V.mp4', 'Ghoulish Girl 3', 27),
    new Video('GA_Girl_Roamer4_Win_V.mp4', 'Ghoulish Girl 4', 33),
    new Video('GA_Girl_Startler_Win_V.mp4', 'Ghoulish Girl Startler', 12),
    new Video('GA_HeadOfHouse_Roamer1_Win_V.mp4', 'Head of the House 1', 27),
    new Video('GA_HeadOfHouse_Roamer2_Win_V.mp4', 'Head of the House 2', 27),
    new Video('GA_HeadOfHouse_Roamer3_Win_V.mp4', 'Head of the House 3', 29),
    new Video('GA_HeadOfHouse_Roamer4_Win_V.mp4', 'Head of the House 4', 27),
    new Video('GA_HeadOfHouse_Startler_Win_V.mp4', 'Head of the House Startler', 12),
    new Video('GA_Wraith_Roamer1_Win_V.mp4', 'Wrathful Wraith 1', 25),
    new Video('GA_Wraith_Roamer2_Win_V.mp4', 'Wrathful Wraith 2', 24),
    new Video('GA_Wraith_Roamer3_Win_V.mp4', 'Wrathful Wraith 3', 25),
    new Video('GA_Wraith_Roamer4_Win_V.mp4', 'Wrathful Wraith 4', 23),
    new Video('GA_Wraith_Startler_Win_V.mp4', 'Wrathful Wraith Startler', 12),
    new Video('test-long-spook.mp4', 'Spooky spooky test', 50),
    new Video('test-long-startle.mp4', 'Startle test', 19),
    new Video('test-long-startle-witch.mp4', 'Startle witch', 24),
    new Video('test-long-startle-girl.mp4', 'Startle girl', 22),
    new Video('test-long-startle-head.mp4', 'Startle head', 22),
    new Video('test-long-startle-wraith.mp4', 'Startle wraith', 22)
];

let ALL_VIDEOS = VIDEOS.concat(BLANK_VIDEO)

let DEVICE_NAME = 'Chromecast-70c4c8babee87879b01e6d819b6b5e97';

enum REPEAT_TYPE {
    REPEAT_OFF = "REPEAT_OFF",
    REPEAT_SINGLE = "REPEAT_SINGLE"
}

export class Chromecaster {
    private player: any // this should be a more specific type here!
    private isReady: boolean = false;
    private isPlayingBlank = false;
    private baseServerUrl: string

    constructor(baseServerUrl: string = 'https://jmattfong-halloween.s3.us-west-2.amazonaws.com', deviceName: string = DEVICE_NAME) {
        this.baseServerUrl = baseServerUrl;
        const client = new Client();
        const chromecast = mdns.createBrowser(mdns.tcp('googlecast'));
        
        const onConnect = (error: Error, player: any) => {
            console.log(`found device. Connecting to ${player}`);
            // console.dir(player);
            if (error != null) {
                console.log(`failed to player: ${player}`)
                client.close();
                return;
            }

            this.player = player;
            this.isReady = true;
            this.player.on('status', function(status) {
                console.log('status broadcast playerState=%s', status.playerState);
                // on state change, we should play the blank video
                // we need to test what state changes there are, but we should always play the blank video if a video finishes playing
                if (status.playerStatus === 'IDLE') {
                    this.playBlankVideo();
                }
                // this.playBlankVideo()
            }.bind(this));
        };

        this.setupConnection(deviceName, chromecast, client, onConnect.bind(this));

        chromecast.start();
    }
    
    private setupConnection(deviceName: string, chromecast: any, client: any, onConnect: (error: Error, player: any) => void) {
        chromecast.on('serviceUp', function(service) {
            console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);

            if (service.name !== deviceName) {
                console.log(`${service.name} does nawt match the requested device ${deviceName}`);
                return;
            }
            
            client.connect(service.addresses[0], function() {
                console.log('connected to device ' + service.addresses[0]);
                client.launch(DefaultMediaReceiver, function(error, player) {
                    onConnect(error, player);
                });
            }); 
        });
    }

    public async awaitReadyPlayer(): Promise<void> {
        let count = 0;
        console.log('checking to see if the player is ready');
        while (!this.isReady)  {
            // if we have waited 1 minute for connection, fail setup
            if (count > 12) {
                throw new Error('failed to setup in 60 seconds');
            }

            console.log('the chromecast connection is not ready. Sleeping for 5 second');
            await this.sleep(5000);
            count++;
        }
    }

    public async playRandomVideo() {
        // get random video and play it
        this.isPlayingBlank = false;
        const media = this.createMediaForLink(this.getRandomVideo())
        console.log(`playing video @ ${media.contentId}`)
        this.player.load(media, { autoplay: true, repeatMode: REPEAT_TYPE.REPEAT_OFF }, function(error, status) {
            if (error != null) {
                console.log(`error playing media: ${error}`);
            }

            if (status != null) {
                console.log('media loaded playerState=%s', status.playerState);
            } else {
                console.log('no status :(')
            }
        });
    }

    private getRandomVideo(): Video {
        return VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
    }

    public async playBlankVideo(): Promise<void> {
        console.log('playing blank video');
        this.isPlayingBlank = true;
        const media = this.createMediaForLink(BLANK_VIDEO)
        this.player.load(media, { autoplay: true, repeatMode: REPEAT_TYPE.REPEAT_OFF }, function(error, status) {
            if (error != null) {
                console.log(`error playing media: ${error}`);
            }

            if (status != null) {
                console.log('media loaded playerState=%s', status.playerState);
            } else {
                console.log('no status :(')
            }
        });
    }

    private createMediaForLink(vid: Video) {
        return {
            // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
            contentId: `${this.baseServerUrl}/${vid.getFileName()}`,
            contentType: 'video/mp4',
            streamType: 'BUFFERED', // or LIVE

            // Title and cover displayed while buffering
            metadata: {
                type: 0,
                metadataType: 0,
                title: vid.getName(), 
                images: [
                    // maybe we can use a black image here to display while buffering?
                    //{ url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
                ]
            }        
        };
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}