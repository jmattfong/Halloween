import { readFileSync } from 'fs';

const v3 = require('node-hue-api').v3;

interface HueConfig {
    hueUsername: string
}

export class SpookyHueApi {
    private lightApi: any
    private isConnected: boolean = false;
    private username: string
    constructor(configPath: string) {
        if (configPath === '') {
            throw new Error('config path must set');
        }
        const fileContents = readFileSync(configPath, { encoding: 'utf-8' });
        const config: HueConfig = JSON.parse(fileContents);
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

    public getIsConnected() {
        return this.isConnected;
    }

    public async setLightState(lightId: number, state: any): Promise<void> {
        await this.lightApi.lights.setLightState(lightId, state)
    }

    public async getLights(): Promise<any> {
        if (!this.isConnected) {
            throw new Error('not connected to the hue hub');
        }
        const lights = await this.lightApi.getAll();
        return lights;
    }
}