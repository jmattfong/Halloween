const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

export class SpookyHue {
    private lightApi: any
    private username: string
    constructor(username: string) {
        this.username = username;
    }

    public async connect() {
        let searchResults = await v3.discovery.nupnpSearch();
        console.log(`found ${searchResults.length} hubs. Connecting to the first one: ${searchResults[0]}`);
        const host = searchResults[0].ipaddress;
        console.log(`connecting to ${host}`)
        await v3.api.createLocal(host).connect(this.username);
        console.log('connected!')
    }

    public async getLights() {
        throw new Error('not implemented yet');
    }

    public async playPattern(lightId: number, patterns: LightPattern[]) {
        console.log('playing light pattern');
        patterns.forEach(async p => {
            console.log(`playing pattern: ${typeof p}`);
            await p.run(this.lightApi, lightId);
            console.log('done playing pattern');
        });

        console.log('dont playing all patterns. Setting light back to default state')
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

        while (true) {
            const state = new LightState()
                .on()
                .ct(200)
                .brightness(getRandomInt(100))
                .transitiontime(0);

            lightApi.lights.setLightState(lightId, state);
            const currTime = new Date();
            if (currTime.getTime() - startTime.getTime() < this.durationMs) {
                return;
            }

            await sleep(getRandomInt(200) + 50);
        }
    }
}

export class OffPattern implements LightPattern {
    private durationMs: number
    constructor(durationMs: number) {
        this.durationMs = durationMs;
    }

    public async run(lightId: number, lightApi: any): Promise<void> {
        const state = new LightState().off();
        lightApi.lights.setLightState(lightId, state);
        await sleep(getRandomInt(200) + 50);
    }
}

export class StableColourPattern implements LightPattern {
    private r: number
    private g: number
    private b: number
    private brightness: number
    private durationMs: number
    constructor(r, g, b, brightness, durationMs: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.brightness = brightness;
        this.durationMs = durationMs;
    }

    public async run(lightId: number, lightApi: any): Promise<void> {
        const state = new LightState()
            .on()
            .ct(200)
            .rgb(this.r, this.g, this.b)
            .brightness(this.brightness)
            .transitiontime(0);
        lightApi.lights.setLightState(lightId, state);
        await sleep(this.durationMs);
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}