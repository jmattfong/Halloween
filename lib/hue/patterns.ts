import { CIEColour } from "./colour";
import { SpookyHueApi } from "./hue";
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("hue-pattern")

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;
var player = require('play-sound')()

export abstract class Pattern {
    protected durationMs: number;
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    public getDurationMs() {
        return this.durationMs;
    }

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        throw new Error('not implemented');
    }

    public cancel() {
        // do nothing
    }
}

// Lol this is highly functional code
export class SoundPattern extends Pattern {

    private soundFile: string
    private lightPattern: Pattern
    private soundToVideoDelayMs: number

    constructor(soundFile: string, lightPattern: Pattern, soundToVideoDelayMs: number) {
        super(lightPattern.getDurationMs());
        this.soundFile = soundFile;
        this.lightPattern = lightPattern;
        this.soundToVideoDelayMs = soundToVideoDelayMs;
    }

    public cancel() {
        this.lightPattern.cancel();
    }

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        player.play(this.soundFile, function (err: any) {
            console.log(`[ERROR]: something went wrong playing sound: ${err}`)
        });
        await sleep(this.soundToVideoDelayMs);
        return this.lightPattern.run(lightId, lightApi);
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

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        const startTime = new Date();

        let lightOn = 1;
        while (!this.isCancelled) {
            const state = new LightState()
                .on() // call this once
                .ct(200)
                .on(lightOn * 100) // call this again
                .brightness(getRandomInt(100))
                .transitiontime(0);

            await lightApi.setLightState(lightId, state);
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

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        await sleep(this.durationMs);
        const wasCancelled = this.isCancelled;
        this.isCancelled = false;
        return wasCancelled;
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

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        const state = new LightState().off()
            // Weird, but this is in increments of 100ms
            .transitiontime(this.transitionSeconds * 10);
        await lightApi.setLightState(lightId, state);
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

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        const state = new LightState()
            .on()
            .ct(200)
            .brightness(this.brightness)
            // Weird, but this is in increments of 100ms
            .transitiontime(this.transitionSeconds * 10);
        await lightApi.setLightState(lightId, state);
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

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        const state = new LightState()
            .on()
            .ct(200)
            .xy(this.colour.getX(), this.colour.getY())
            .brightness(this.brightness)
            // Weird, but this is in increments of 100ms
            .transitiontime(this.transitionTimeSeconds * 10);
        await lightApi.setLightState(lightId, state);
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