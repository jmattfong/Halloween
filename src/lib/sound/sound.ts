import { sleep } from "../scene/patterns";
const { exec } = require('node:child_process');
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
const log: CategoryLogger = getLogger("sound-player");

const macPlayCommand = (path, volume) => `afplay \"${path}\" -v ${volume}`

/* WINDOW PLAY COMMANDS */
const addPresentationCore = `Add-Type -AssemblyName presentationCore;`
const createMediaPlayer = `$player = New-Object system.windows.media.mediaplayer;`
const loadAudioFile = path => `$player.open('${path}');`
const playAudio = `$player.Play();`
const stopAudio = `Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`

const windowPlayCommand = (path, volume) =>
  `powershell -c ${addPresentationCore} ${createMediaPlayer} ${loadAudioFile(
    path,
  )} $player.Volume = ${volume}; ${playAudio} ${stopAudio}`

export class SoundPlayer {
    private controller: AbortController;
    constructor() {
    }

    public async play(soundFile: string, volume: number) {
        this.controller = new AbortController();
        log.info(`attempting to play ${soundFile}`);

	const volumeAdjustedByOs = process.platform == "darwin" ? Math.min(2, volume * 2) : volume;

	const playCommand = process.platform == "darwin" ? macPlayCommand(soundFile, volumeAdjustedByOs) : windowPlayCommand(soundFile, volumeAdjustedByOs);

	log.debug(`running command: ${playCommand}`);

        const { signal } = this.controller;
        exec(playCommand, { signal }, (error) => {
            log.info(`Sound ${soundFile} has been stopped. Error: ${error}`);
        });
    }

    public stop() {
        if (this.controller != undefined) {
            this.controller.abort();
        }
    }

}
