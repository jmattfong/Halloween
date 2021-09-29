import * as readline from 'readline';
import { Video } from './videos';
import { getLogger } from './logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("cli")

export class SpookyCli {
    private videos: Video[]
    private rl: readline.Interface
    private playVideoCallback: (video: Video) => void

    constructor(videos: Video[], playVideoCallback: (video: Video) => void) {
        this.videos = videos;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.playVideoCallback = playVideoCallback;
    }

    public async start() {
        this.askForInput();
    }

    private async askForInput() {
        this.rl.question(this.getQueryString(), (answer) => {
            try {
                const videoId = Number(answer.trim())
                if (videoId >= 1 && videoId <= this.videos.length) {
                    this.playVideoCallback(this.videos[videoId - 1]);
                } else {
                    log.info('invalid video id')
                }
            } catch (error) {
                log.info(`invalid input "${answer}". Must be a number from the following list:`);
            }
            this.askForInput()
        });

    }

    private getQueryString(): string {
        let result = `
************************************************
Play a spooky video from the below list:
`

        for (let i = 0; i < this.videos.length; i++) {
            result += `[${i + 1}]: ${this.videos[i].getName()} (${this.videos[i].getVideoLengthSeconds()}s)\n`
        }

        result += "************************************************\n\n"

        return result;
    }
}