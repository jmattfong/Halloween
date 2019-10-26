import { CIEColour } from "./colour";
import { SpookyHueApi } from "./hue";

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;
var player = require('play-sound')()

export interface Pattern {
    getDurationMs: () => number,
    run: (lightId: number, lightApi: SpookyHueApi) => Promise<boolean>
    cancel: () => void
}

// Lol this is highly functional code
export class SoundPattern implements Pattern {

    private soundFile: string
    private lightPattern: Pattern

    constructor(soundFile: string, lightPattern: Pattern) {
        this.soundFile = soundFile;
        this.lightPattern = lightPattern;
    }

    public getDurationMs() {
        return this.lightPattern.getDurationMs();
    }

    public cancel() {
        this.lightPattern.cancel();
    }

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        player.play(this.soundFile, function(err){
            console.log(`[ERROR]: something went wrong playing sound: ${err}`)
        });
        await sleep(500);
        return this.lightPattern.run(lightId, lightApi);
    }

}

export class FlickerPattern implements Pattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public getDurationMs() {
        return this.durationMs;
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

export class SleepPattern implements Pattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    public getDurationMs() {
        return this.durationMs;
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

export class OffPattern implements Pattern {
    private durationMs: number
    private transitionSeconds: number
    constructor(durationSeconds: number, transitionSeconds: number = 0) {
        this.durationMs = durationSeconds * 1000;
        this.transitionSeconds = transitionSeconds;
    }

    public getDurationMs() {
        return this.durationMs;
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

export class StableColourPattern implements Pattern {
    private colour: CIEColour
    private brightness: number
    private durationMs: number
    private transitionTimeSeconds: number
    constructor(colour: CIEColour, brightness, durationSeconds: number, transitionTimeSeconds: number) {
        this.colour = colour;
        this.brightness = brightness;
        this.durationMs = durationSeconds * 1000;
        this.transitionTimeSeconds = transitionTimeSeconds;
    }

    public getDurationMs() {
        return this.durationMs;
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

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}