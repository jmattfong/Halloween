var ChromecastAPI = require('chromecast-api')

let DEVICE_NAME = 'Basement TV'

let BLANK_VIDEO = ['GA_Buffer_Black_V.mp4', 'Blank Buffer', 10]
let BLANK_TIME = BLANK_VIDEO[2]

let VIDEOS = [['GA_Beauty_Roamer1_Win_V.mp4', 'Beckoning Beauty 1', 32],
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

    private browser
    private server: string
    private current_video_start_time = 0
    private current_video_duration = 0

    constructor(server: string, deviceName: string = DEVICE_NAME) {
        if (server == null || server === '') {
            throw new Error('config path must set');
        }
        this.server = server
        this.browser = new ChromecastAPI.Browser()

        this.startPlayingBlankVideo()
    }

    private startPlayingBlankVideo(): void {
        // TODO
    }

    public playRandomVideo(): void {
        var video = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
        this.playVideo(video)
    }

    public playVideo(video): void {

    }
}

/*
async function main() {
    const spook = new ChromecastPlayer("")
}

main()
*/