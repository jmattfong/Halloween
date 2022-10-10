
export class Video {
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

export let BLANK_VIDEO = new Video('GA_Buffer_Black_V.mp4', 'Blank Buffer', 10);

export let SPOOKY_VIDEOS = [
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

export let INTRO_VIDEO_2022 = new Video('GA_Beauty_Roamer1_Win_V.mp4', 'Beckoning Beauty 1', 32)

export let ALL_VIDEOS = SPOOKY_VIDEOS.concat(BLANK_VIDEO);