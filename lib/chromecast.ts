var ChromecastAPI = require('chromecast-api')

let DEVICE_NAME = 'Basement TV'

let BLANK_VIDEO = ['GA_Buffer_Black_V.mp4', 'Blank Buffer', 10]
let BLANK_TIME = BLANK_VIDEO[2]

let VIDEOS = [
['GA_Beauty_Roamer1_Win_V.mp4', 'Beckoning Beauty 1', 32],
['GA_Beauty_Roamer2_Win_V.mp4', 'Beckoning Beauty 2', 34],
['GA_Beauty_Roamer3_Win_V.mp4', 'Beckoning Beauty 3', 45],
['GA_Beauty_Roamer4_Win_V.mp4', 'Beckoning Beauty 4', 30],
['GA_Beauty_Startler_Win_V.mp4', 'Beckoning Beauty Startler', 14],
['GA_Girl_Roamer1_Win_V.mp4', 'Ghoulish Girl 1', 29],
['GA_Girl_Roamer2_Win_V.mp4', 'Ghoulish Girl 2', 29],
['GA_Girl_Roamer3_Win_V.mp4', 'Ghoulish Girl 3', 27],
['GA_Girl_Roamer4_Win_V.mp4', 'Ghoulish Girl 4', 33],
['GA_Girl_Startler_Win_V.mp4', 'Ghoulish Girl Startler', 12],
['GA_HeadOfHouse_Roamer1_Win_V.mp4', 'Head of the House 1', 27],
['GA_HeadOfHouse_Roamer2_Win_V.mp4', 'Head of the House 2', 27],
['GA_HeadOfHouse_Roamer3_Win_V.mp4', 'Head of the House 3', 29],
['GA_HeadOfHouse_Roamer4_Win_V.mp4', 'Head of the House 4', 27],
['GA_HeadOfHouse_Startler_Win_V.mp4', 'Head of the House Startler', 12],
['GA_Wraith_Roamer1_Win_V.mp4', 'Wrathful Wraith 1', 25],
['GA_Wraith_Roamer2_Win_V.mp4', 'Wrathful Wraith 2', 24],
['GA_Wraith_Roamer3_Win_V.mp4', 'Wrathful Wraith 3', 25],
['GA_Wraith_Roamer4_Win_V.mp4', 'Wrathful Wraith 4', 23],
['GA_Wraith_Startler_Win_V.mp4', 'Wrathful Wraith Startler', 12],
['test-long-spook.mp4', 'Spooky spooky test', 50],
['test-long-startle.mp4', 'Startle test', 19],
['test-long-startle-witch.mp4', 'Startle witch', 24],
['test-long-startle-girl.mp4', 'Startle girl', 22],
['test-long-startle-head.mp4', 'Startle head', 22],
['test-long-startle-wraith.mp4', 'Startle wraith', 22]]

let ALL_VIDEOS = VIDEOS.concat(BLANK_VIDEO)

export class ChromecastPlayer {

    private playingVideo: boolean = false

    private server: string

    private device

    constructor(server: string = 'https://jmattfong-halloween.s3.us-west-2.amazonaws.com', deviceName: string = DEVICE_NAME) {
        if (server == null || server === '') {
            throw new Error('server url is null or empty');
        }
        this.server = server

        this.startPlayLoop()
    }

    private startPlayLoop(): void {
        var browser = new ChromecastAPI.Browser()
        browser.on('deviceOn', function(device) {
            this.device = device
            this.playBlank()
        })
        return null
    }

    public playRandomVideo(): void {
        this.playingVideo = true
        var video = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
        this.playVideo(video)
    }

    private playBlank(): void {
        if (!this.playingVideo) {
            this.playVideo(BLANK_VIDEO, false)
        }
    }

    private playVideo(video, logs: boolean = true): void {
        var url = video[0]
        var name = video[1]
        var lengthSeconds = video[2]

        if (this.playingVideo) {
            console.log('Another video is already playing, not playing video ' + name)
        } else {
            if (logs) {
                console.log('Requesting video ' + name + ' with url ' + url)
            }

            this.device.play(url, 0, function() {
                if (logs) {
                    console.log('Playing video ' + name + ' with url ' + url)
                }
            })

            setTimeout(function () {
                console.log('Video ' + name + ' is over, going back to playing nothing')
                this.playingVideo = false
                this.playBlank()
            }, lengthSeconds * 1000)
        }
    }
}

/*
// TODO remove
async function main() {
    const chromecastPlayer = new ChromecastPlayer()

    // Wait 20 seconds to start playing a video
    setTimeout(function () {
        chromecastPlayer.playRandomVideo()
    }, 20000)
}

main()
*/
