import { sleep } from "../scene/patterns";
const { exec } = require('node:child_process');
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
const log: CategoryLogger = getLogger("sound-player");

export class SoundPlayer {
    private controller: AbortController;
    constructor() {
    }

    public async play(soundFile: string, volume: number) {
        this.controller = new AbortController();
        log.info(`attempting to play ${soundFile}`);
        const { signal } = this.controller;
        exec(`afplay ${soundFile} -v ${volume}`, { signal }, (_error) => {
            log.info(`Canceled ${soundFile} playback`);
        });
    }

    public stop() {
        if (this.controller != undefined) {
            this.controller.abort();
        }
    }

}
