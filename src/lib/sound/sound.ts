import { platform } from "os";
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

        if (platform() === 'darwin') {
            this.play_music_mac(soundFile, volume, signal);
        } else {
            this.play_music_linux(soundFile, volume, signal);
        }
    }

    async play_music_mac(soundFile: string, volume: number, signal: AbortSignal) {
        log.debug("playing sound on mac")
        exec(`afplay ${soundFile} -v ${volume}`, { signal }, (_error) => {
            log.info(`error: ${_error}`)
            log.info(`Canceled ${soundFile} playback`);
        });
    }

    async play_music_linux(soundFile: string, volume: number, signal: AbortSignal) {
        log.debug("playing sound on linux")
        exec(`mpg321 ${soundFile} -g ${volume * 100}`, { signal }, (_error) => {
            log.info(`error: ${_error}`)
            log.info(`Canceled ${soundFile} playback`);
        });
    }

    public stop() {
        if (platform() === 'darwin') {
            if (this.controller != undefined) {
                this.controller.abort();
            }
        } else {
            exec(`pgrep mpg321 | xargs kill -9`, (_error) => {
                log.info(`error: ${_error}`)
                log.info(`Canceled sound playback`);
            }
    }
