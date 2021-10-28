import { CIEColour } from "../hue/colour";
import { SpookyHueApi } from "../hue/hue";
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';
import { SpookyHueBulbPlayer } from "../hue/spooky_bulb_player";
import {Event} from "./events"

const log: CategoryLogger = getLogger("hue-pattern")

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;
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

// Lol this is highly functional code
export class SoundPattern extends Pattern {

    private soundFile: string
    // The volume you want to play the audio at! Should be between 0 and 1
    private volume: number
    private lightPattern: Pattern
    private soundToPatternDelayMs: number

    constructor(soundFile: string, lightPattern: Pattern, soundToPatternDelayMs: number, volume: number = 0.5) {
        super(lightPattern.getDurationMs());
        this.soundFile = soundFile;

        if (volume <= 0 || volume > 1) {
            throw RangeError("volume be in the range (0,1]")
        }

        this.volume = volume;
        this.lightPattern = lightPattern;
        this.soundToPatternDelayMs = soundToPatternDelayMs;
    }

    public cancel() {
        this.lightPattern.cancel();
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        player.play(this.soundFile, this.volume).then((error: any) => {
            if (error) {
                log.error(`something went wrong playing ${this.soundFile}`, error);
            } else {
                log.info(`playing ${this.soundFile} is complete`)
            }
        });
        await sleep(this.soundToPatternDelayMs);
        return this.lightPattern.run(lightName, lightApi);
    }
}

export class FlickerPattern extends Pattern {
    constructor(durationSeconds: number) {
        super(durationSeconds);
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        const startTime = new Date();

        let lightOn = 1;
        while (!this.isCancelled) {
            const state = new LightState()
                .on() // call this once
                .ct(200)
                .on(lightOn * 100) // call this again
                .brightness(getRandomInt(100))
                .transitiontime(0);

            await lightApi.setLightState(lightName, state);
            const currTime = new Date();

            if (currTime.getTime() - startTime.getTime() > this.durationMs) {
                return false;
            }

            lightOn = (lightOn + 1) % 2
            const linearInterp = 1 - ((currTime.getTime() - startTime.getTime()) / this.durationMs);
            await sleep((getRandomInt(200) * linearInterp) + 30);
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
    private colour: CIEColour

    constructor(colour: CIEColour, durationSeconds: number) {
        super(durationSeconds)
        this.colour = colour;
    }
    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        this.isCancelled = false;
        const patternA = new StableColourPattern(this.colour, 60, 2, 2);
        const patternB = new StableColourPattern(this.colour, 0, 3, 3)

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
    private brightness: number
    constructor(brightness: number, durationSeconds: number, transitionSeconds: number = 0) {
        super(durationSeconds);
        this.brightness = brightness;
        this.transitionSeconds = transitionSeconds;
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        const state = new LightState()
            .on()
            .ct(200)
            .brightness(this.brightness)
            // Weird, but this is in increments of 100ms
            .transitiontime(this.transitionSeconds * 10);
        await lightApi.setLightState(lightName, state);
        await sleep(this.durationMs);
        const wasCancelled = this.isCancelled;
        this.isCancelled = false;
        return wasCancelled;
    }
}

export class StableColourPattern extends Pattern {
    private colour: CIEColour
    private brightness: number
    private transitionTimeSeconds: number
    constructor(colour: CIEColour, brightness: number, durationSeconds: number, transitionTimeSeconds: number) {
        super(durationSeconds)
        this.colour = colour;
        this.brightness = brightness;
        this.transitionTimeSeconds = transitionTimeSeconds;
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightName: string, lightApi: SpookyHueApi): Promise<boolean> {
        const state = new LightState()
            .on()
            .ct(200)
            .xy(this.colour.getX(), this.colour.getY())
            .brightness(this.brightness)
            // Weird, but this is in increments of 100ms
            .transitiontime(this.transitionTimeSeconds * 10);
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
