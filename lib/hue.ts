import { readFileSync } from 'fs';

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

const secretContents = readFileSync('./secrets/secrets.json', { encoding: 'utf-8' })
let secrets = JSON.parse(secretContents);

const USERNAME = secrets.hueUsername
    // The name of the light we wish to retrieve by name
    , LIGHT_ID = 3
    ;

export class SpookyHue {
    constructor(username: string) {
        v3.discovery.nupnpSearch()
        .then(searchResults => {
            console.log(`found ${searchResults.length} hubs. Connecting to the first one: ${searchResults[0]}`);
            const host = searchResults[0].ipaddress;
            console.log(`connecting to ${host}`)
            v3.api.createLocal(host).connect(username)
        });
    }

    public async start() {

    }

    public async assignCallbackToLights() {

    }
}

export interface LightPattern {
    run: (lightApi: any, lightObject: any) => void
}

export class FlickerPattern implements LightPattern {
    private durationMs: number
    constructor(durationSeconds: number) {
        this.durationMs = durationSeconds * 1000;
    }

    public async run(lightApi: any, lightObject: any): Promise<void> {
        const start = new Date();

        while (true) {

            const state = new LightState()
                .on()
                .ct(200)
                .on(10 * 100)
                .brightness(getRandomInt(100))
                .transitiontime(0);

            lightApi.lights.setLightState(lightObject.id, state);
            await sleep(getRandomInt(200) + 50);


        }
    }
}

export class OffPattern implements LightPattern {
    private durationMs: number
    constructor(durationMs: number) {
        this.durationMs = durationMs;
    }

    public async run(lightApi: any, lightObject: any): Promise<void> {
        const state = new LightState().off();
        lightApi.lights.setLightState(lightObject.id, state);
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

    public async run(lightApi: any, lightObject: any): Promise<void> {
        const state = new LightState()
            .on()
            .ct(200)
            .rgb(this.r, this.g, this.b)
            .brightness(this.brightness)
            .transitiontime(0);
        lightApi.lights.setLightState(lightObject.id, state);
        await sleep(this.durationMs);
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function doMoreShit(api) {
    var bright = 0;
    while (true) {
        console.log('Setting state to ' + (bright * 100))
        // Using a LightState object to build the desired state
        const state = new LightState()
            .on()
            .ct(200)
            .on(bright * 100)
            .brightness(getRandomInt(100))
            .transitiontime(0)
            ;
        let attributesAndState = await api.lights.getLightAttributesAndState(LIGHT_ID);

        console.log(attributesAndState["state"]["on"])
        if (attributesAndState["state"]["on"] == false) {
            // await sleep(300)
        }

        // .then(attributesAndState => {
        //   // Display the details of the light
        //   // console.log(JSON.stringify(attributesAndState, null, 2));

        // });
        bright = (bright + 1) % 2
        api.lights.setLightState(LIGHT_ID, state);
        api.lights.setLightState(2, state);
        await sleep(getRandomInt(200) + 50)
    }
}