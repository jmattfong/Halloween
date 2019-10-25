import { CIEColour } from "./colour";
import { SpookyHueApi } from "./hue";

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

export interface LightPattern {
    run: (lightId: number, lightApi: SpookyHueApi) => Promise<boolean>
    cancel: () => void
}

export class FlickerPattern implements LightPattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
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
            await sleep(getRandomInt(200) + 50);
        }

        this.isCancelled = false;
        return true;
    }
}

export class SleepPattern implements LightPattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
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

export class OffPattern implements LightPattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    isCancelled = false;
    public cancel() {
        this.isCancelled = true;
    }

    public async run(lightId: number, lightApi: SpookyHueApi): Promise<boolean> {
        const state = new LightState().off().transitiontime(0);
        await lightApi.setLightState(lightId, state);
        await sleep(this.durationMs);
        const wasCancelled = this.isCancelled;
        this.isCancelled = false;
        return wasCancelled;
    }
}

export class StableColourPattern implements LightPattern {
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
            .transitiontime(this.transitionTimeSeconds);
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