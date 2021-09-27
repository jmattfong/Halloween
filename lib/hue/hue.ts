import { readFileSync } from 'fs';
import { HueSensor } from './sensor';

const v3 = require('node-hue-api').v3;

interface HueConfig {
    hueUsername: string
}

export class SpookyHueApi {
    private hueApi: any
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
        console.log(`found ${searchResults.length} hubs. Connecting to the first one cuz #yolo`);
        const host = searchResults[0].ipaddress;
        console.log(`connecting to ${host}`)
        this.hueApi = await v3.api.createLocal(host).connect(this.username);
        console.log('connected!')
        this.isConnected = true;
    }

    public getIsConnected() {
        return this.isConnected;
    }

    public async setLightState(lightId: number, state: any): Promise<void> {
        if (!this.isConnected) {
            throw new Error('not connected to the hue hub');
        }
        await this.hueApi.lights.setLightState(lightId, state)
    }

    public async getLights(): Promise<any> {
        if (!this.isConnected) {
            throw new Error('not connected to the hue hub');
        }
        return await this.hueApi.lights.getAll();
    }

    public async getSensor(sensorId: number): Promise<HueSensor> {
        if (!this.isConnected) {
            throw new Error('not connected to the hue hub');
        }
        const sensor = await this.hueApi.sensors.get(sensorId);
        return new HueSensor(this.hueApi.sensors, sensor.id);
    }

    public async getSensors(): Promise<HueSensor[]> {
        if (!this.isConnected) {
            throw new Error('not connected to the hue hub');
        }

        return await this.hueApi.sensors.getAll().map((s: any) => { new HueSensor(this.hueApi.sensors, s.id) });
    }
}