import { BLANK_VIDEO, Video, SPOOKY_VIDEOS } from "./videos";
import { getLogger } from './logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("chromecast")

var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns');

let DEVICE_NAME = 'Chromecast-70c4c8babee87879b01e6d819b6b5e97';

export class Chromecaster {
    private player: any // this should be a more specific type here!
    private isReady: boolean = false;
    private currentPlayingVideo: Video | null;
    private baseServerUrl: string
    private videoPlayStartTime: number
    private debug: boolean
    private isBlankPlaying: boolean = false;

    constructor(baseServerUrl: string = 'https://jmattfong-halloween.s3.us-west-2.amazonaws.com', deviceName: string = DEVICE_NAME, debug: boolean = false) {
        this.baseServerUrl = baseServerUrl;
        this.debug = debug;
        const client = new Client();
        const chromecast = mdns.createBrowser(mdns.tcp('googlecast'));

        const onConnect = (error: Error, player: any) => {
            if (error) {
                log.info(`failed to get media player. whyyyy`)
                client.close();
                throw new Error(`${error}`);
            }

            log.info('player setup. Ready to start');
            this.player = player;
            this.isReady = true;
        };

        this.currentPlayingVideo = null;
        this.videoPlayStartTime = 0;

        this.setupConnection(deviceName, chromecast, client, onConnect.bind(this));

        client.on('error', function (err: Error) {
            log.info(`Error:  ${err.message}`);
            client.close();
        });

        chromecast.start();
    }

    private setupConnection(deviceName: string, chromecast: any, client: any, onConnect: (error: Error, player: any) => void) {
        chromecast.on('serviceUp', function (service: any) {
            log.info('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);

            if (service.name !== deviceName) {
                log.info(`${service.name} does nawt match the requested device ${deviceName}`);
                return;
            }

            client.connect(service.addresses[0], function () {
                log.info('connected to device ' + service.addresses[0]);
                client.launch(DefaultMediaReceiver, function (error: any, player: any) {
                    onConnect(error, player);
                });
            });
        });
    }

    public async start(): Promise<void> {
        let count = 0;
        log.info('checking to see if the player is ready');
        while (!this.isReady) {
            // if we have waited 1 minute for connection, fail setup
            if (count > 12) {
                throw new Error('failed to setup in 60 seconds');
            }

            log.info('the chromecast connection is not ready. Sleeping for 5 second');
            await this.sleep(5000);
            count++;
        }

        log.info('chromecast is ready. Starting spooky vids, with some spooky blank vids of course');

        setInterval(() => {
            if (!this.currentPlayingVideo) {
                log.info('nothing playing. Playing blank video')
                this.playBlankVideo();
                return;
            }

            const now = Date.now();
            const timePlayedMs = (now - this.videoPlayStartTime);
            if ((this.currentPlayingVideo.getVideoLengthSeconds() * 1000) - timePlayedMs < 500) {
                this.playBlankVideo();
            }

        }, 1000);
    }

    public async playRandomVideo(): Promise<void> {
        // get random video and play it
        const spookyVideo = this.getRandomVideo();
        await this.playVideo(spookyVideo);
    }

    public async playBlankVideo(): Promise<void> {
        await this.playVideo(BLANK_VIDEO);
    }

    public async playVideo(video: Video): Promise<void> {
        log.info(`playing video: ${video.getName()}`)
        const media = this.createMediaForLink(video);
        this.currentPlayingVideo = video;
        this.videoPlayStartTime = Date.now();

        // video is about to start playing, set timeout to play the blank video
        this.player.load(media, { autoplay: true }, function (error: any, status: any) {
            if (error != null) {
                log.info(`error playing media: ${error}`);
                return;
            }
        }.bind(this));
    }

    private getRandomVideo(): Video {
        return SPOOKY_VIDEOS[Math.floor(Math.random() * SPOOKY_VIDEOS.length)];
    }

    private createMediaForLink(vid: Video) {
        let media = {
            // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
            contentId: `${this.baseServerUrl}/${vid.getFileName()}`,
            contentType: 'video/mp4',
            streamType: 'BUFFERED', // or LIVE
            metadata: {},
        };

        if (this.debug) {
            media.metadata = {
                type: 0,
                metadataType: 0,
                title: vid.getName(),
                images: [
                    // maybe we can use a black image here to display while buffering?
                    //{ url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
                ]
            };
        }

        return media;
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}