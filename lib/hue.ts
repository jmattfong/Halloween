import { readFileSync } from 'fs';
import { CIEColour } from './colour';

interface HueConfig {
    hueUsername: string
}

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

export class SpookyHue {
    private lightApi: any
    private isConnected: boolean = false;
    private username: string
    constructor(configPath: string) {
        if (configPath === '') {
            throw new Error('config path must set');
        }
        const fileContents = readFileSync(configPath, {encoding: 'utf-8'})
        let config: HueConfig = JSON.parse(fileContents);
        this.username = config.hueUsername;
    }

    public async connect() {
        let searchResults = await v3.discovery.nupnpSearch();
        console.log(`found ${searchResults.length} hubs. Connecting to the first one: ${searchResults[0]}`);
        const host = searchResults[0].ipaddress;
        console.log(`connecting to ${host}`)
        this.lightApi = await v3.api.createLocal(host).connect(this.username);
        console.dir(this.lightApi.lights)
        console.log('connected!')
        this.isConnected = true;
    }

    public async getLights(): Promise<any> {
        if (!this.isConnected) {
            throw new Error('not connected to the hue hub');
        }
        const lights = await this.lightApi.getAll();
        return lights;
    }

    public async playPattern(lightId: number, patterns: LightPattern[]) {
        if (!this.isConnected) {
            throw new Error('not connected to the hue hub');
        }

        console.log('playing light pattern');
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            console.log(`playing pattern: ${pattern.constructor.name}`);
            await pattern.run(lightId, this.lightApi);
            console.log('done playing pattern');
        }

        console.log('done playing all patterns. Setting light back to default state');
        // set light back to default state
    }
}

export interface LightPattern {
    run: (lightId: number, lightApi: any) => Promise<void>
}

export class FlickerPattern implements LightPattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    public async run(lightId: number, lightApi: any): Promise<void> {
        const startTime = new Date();

        let lightOn = 1;

        while (true) {
            const state = new LightState()
                .on() // call this once
                .ct(200)
                .on(lightOn * 100) // call this again
                .brightness(getRandomInt(100))
                .transitiontime(0);

            await lightApi.lights.setLightState(lightId, state);
            const currTime = new Date();

            if (currTime.getTime() - startTime.getTime() > this.durationMs) {
                return;
            }

            lightOn = (lightOn + 1) % 2
            await sleep(getRandomInt(200) + 50);
        }
    }
}

export class SleepPattern implements LightPattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    public async run(lightId: number, lightApi: any): Promise<void> {
        await sleep(this.durationMs);
    }
}

export class OffPattern implements LightPattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    public async run(lightId: number, lightApi: any): Promise<void> {
        const state = new LightState().off().transitiontime(0);
        await lightApi.lights.setLightState(lightId, state);
        await sleep(this.durationMs);
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

    public async run(lightId: number, lightApi: any): Promise<void> {
        const state = new LightState()
            .on()
            .ct(200)
            .xy(this.colour.getX(), this.colour.getY())
            .brightness(this.brightness)
            .transitiontime(this.transitionTimeSeconds);
        await lightApi.lights.setLightState(lightId, state);
        await sleep(this.durationMs);
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}