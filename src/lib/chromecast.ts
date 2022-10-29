import { BLANK_VIDEO, Video, SPOOKY_VIDEOS } from "./videos";
import { getLogger } from './logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("chromecast")

var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
//var mdns = require('mdns');

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
        //const chromecast = mdns.createBrowser(mdns.tcp('googlecast'));

        //const onConnect = (error: Error, player: any) => {
    }

    private setupConnection(deviceName: string, chromecast: any, client: any, onConnect: (error: Error, player: any) => void) {
    }

    public async start(): Promise<void> {
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
