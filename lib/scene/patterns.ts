import { SpookyHueApi } from "../hue/hue";
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';
import { SpookyHueBulbPlayer } from "../hue/spooky_bulb_player";
import { Event} from "./events"
import { Color, ENERGIZE } from "../config"
import LightState from "node-hue-api/lib/model/lightstate/LightState";

const log: CategoryLogger = getLogger("hue-pattern")

const v3 = require('node-hue-api').v3;
const player = require("sound-play");

export abstract class Pattern {
    protected durationMs: number;
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    public getDurationMs() {
        return this.durationMs;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        throw new Error('not implemented');
    }

    public cancel() {
        // do nothing
    }
}

function createLightState(color: Color, transitionSeconds: number, brightness?: number): LightState {
    if (brightness == null) {
        brightness = color.bri
    }
    if (brightness > 254) {
        brightness = 254
    } else if (brightness < 1) {
        brightness = 1
    }
    return new LightState()
            .on(true)
            .bri(brightness)
            .xy(color.xy[0], color.xy[1])
            .hue(color.hue)
            .sat(color.sat)
            .ct(color.ct)
            // Weird, but this is in increments of 100ms
            .transitiontime(transitionSeconds * 10);
}

// Lol this is highly functional code
export class SoundPattern extends Pattern {

    private soundFile: string
    // The volume you want to play the audio at! Should be between 0 and 1
    private volume: number
    private lightPattern: Pattern
    private soundToPatternDelayMs: number

    constructor(soundFile: string, lightPattern: Pattern, soundToPatternDelaySeconds: number, volume: number = 0.5) {
        super(lightPattern.getDurationMs());
        this.soundFile = soundFile;

        if (volume <= 0 || volume > 1) {
            throw RangeError("volume be in the range (0,1]")
        }

        this.volume = volume;
        this.lightPattern = lightPattern;
        this.soundToPatternDelayMs = soundToPatternDelaySeconds * 1000;
    }

    public cancel() {
        this.lightPattern.cancel();
    }

    getSoundFile(): string {
        return this.soundFile;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        let soundFile = this.getSoundFile()
        player.play(soundFile, this.volume).then((error: any) => {
            if (error) {
                log.error(`something went wrong playing ${soundFile}`, error);
            } else {
                log.info(`playing ${soundFile} is complete`)
            }
        });
        await sleep(this.soundToPatternDelayMs);
        return this.lightPattern.run(lightName, lightApi);
    }
}

export class RandomSoundPattern extends SoundPattern {
    soundFiles: string[]
    constructor(soundFiles: string[], lightPattern: Pattern, soundToPatternDelaySeconds: number, volume: number = 0.5) {
        super("", lightPattern, soundToPatternDelaySeconds, volume)
        this.soundFiles = soundFiles
    }

    getSoundFile(): string {
        return this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
    }
}

export class FlickerPattern extends Pattern {
    color: Color
    constructor(durationSeconds: number, color: Color = ENERGIZE) {
        super(durationSeconds);
        this.color = color
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        const startTime = new Date();

        let lightOn = true;
        while (!this.isCancelled) {
            let state = new LightState()
            if (lightOn) {
                let brightness = getRandomInt(154) + 101
                state = createLightState(this.color, 0, brightness)
            } else {
                state = new LightState()
                    .on(false)
                    .transitiontime(0);
            }

            await lightApi.setLightState(lightName, state);
            const currTime = new Date();

            if (currTime.getTime() - startTime.getTime() > this.durationMs) {
                return false;
            }

            lightOn = !lightOn
            await sleep(getRandomInt(50) + 10);
        }

        this.isCancelled = false;
        return true;
    }
}

export class SleepPattern extends Pattern {
    constructor(durationSeconds: number) {
        super(durationSeconds);
    }

    public cancel() {
        // cancel does nothing for sleep pattern, since we just sleep
    }

    public async run(_lightName: string, _lightApi: SpookyHueApi): Promise<boolean> {
        await sleep(this.durationMs);
        return false;
    }
}

export class PulsePattern extends Pattern {
    private color: Color

    constructor(color: Color, durationSeconds: number) {
        super(durationSeconds)
        this.color = color;
    }
    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        this.isCancelled = false;
        const patternA = new StableColourPattern(this.color, 60, 2, 2);
        const patternB = new StableColourPattern(this.color, 0, 3, 3)

        const spookyBulbApi = new SpookyHueBulbPlayer(lightApi);

        const startTime = new Date();

        const intervalId = await spookyBulbApi.playRepeatingEvent(new Event(lightName, patternA, patternB));

        while (!this.isCancelled) {
            const currTime = new Date();
            if (currTime.getTime() - startTime.getTime() > this.durationMs) {
                break;
            }

            await sleep(100);
        }

        clearInterval(intervalId);

        return this.isCancelled;
    }


}

export class OffPattern extends Pattern {
    private transitionSeconds: number
    constructor(durationSeconds: number, transitionSeconds: number = 0) {
        super(durationSeconds);
        this.transitionSeconds = transitionSeconds;
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        const state = new LightState().off()
            // Weird, but this is in increments of 100ms
            .transitiontime(this.transitionSeconds * 10);
        await lightApi.setLightState(lightName, state);
        await sleep(this.durationMs);
        const wasCancelled = this.isCancelled;
        this.isCancelled = false;
        return wasCancelled;
    }
}

export class OnPattern extends Pattern {
    private transitionSeconds: number
    private color: Color

    constructor(color: Color, durationSeconds: number, transitionSeconds: number = 0) {
        super(durationSeconds);
        this.color = color
        this.transitionSeconds = transitionSeconds;
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        const state = createLightState(this.color,this.transitionSeconds)
        await lightApi.setLightState(lightName, state);
        await sleep(this.durationMs);
        const wasCancelled = this.isCancelled;
        this.isCancelled = false;
        return wasCancelled;
    }
}

export class StableColourPattern extends Pattern {
    private color: Color
    private brightness: number
    private transitionTimeSeconds: number
    constructor(color: Color, brightness: number, durationSeconds: number, transitionTimeSeconds: number) {
        super(durationSeconds)
        this.color = color;
        this.brightness = brightness;
        this.transitionTimeSeconds = transitionTimeSeconds;
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        const state = createLightState(this.color, this.transitionTimeSeconds)
        await lightApi.setLightState(lightName, state);
        await sleep(this.durationMs);
        const wasCancelled = this.isCancelled;
        this.isCancelled = false;
        return wasCancelled;
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}
