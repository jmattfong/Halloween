import { RingApi, RingDevice, RingDeviceType, RingDeviceData } from "ring-client-api";
import { readFileSync } from 'fs';

interface RingConfig {
    username: string
    password: string
}

export class RingEnhancedSpookinatorV2 {
    private ring: RingApi
    private sensors: RingDevice[]

    constructor(configPath: string, debug: boolean = false) {
        if (configPath === '') {
            throw new Error('config path must set');
        }
        const fileContents = readFileSync(configPath, {encoding: 'utf-8'})
        let config: RingConfig = JSON.parse(fileContents);
        this.ring = new RingApi({
            cameraStatusPollingSeconds: 2,
            debug: debug,
            email: config.username,
            password: config.password
        });
       this.sensors = new Array(); 
    }

    public addSensorCallback(sensor: RingDevice, callback: (data: RingDeviceData) => void): void {
        console.log(`adding callback to sensor ${sensor.name}`)
        sensor.onData.subscribe((event) => {
            if ((event as RingDeviceData).name) {
                let data = event as RingDeviceData
                console.log(`sensor ${sensor.name} invoked. event: ${data.faulted}`);
                callback(event);
            } else {
                console.log('an unknown event type was received');
            }
        });
    }

    public async getSensors(): Promise<RingDevice[]> {
        if (this.sensors.length === 0) {
            const sensors = await this.getAllContactSensors();
            sensors.forEach(s => this.sensors.push(s));
        }
        return this.sensors;
    }

    private async getAllContactSensors(): Promise<RingDevice[]> {
        const locations = await this.ring.getLocations();
        
        let allDevices: RingDevice[];
        allDevices = new Array();
        for (const location of locations) {
            const devices = await location.getDevices();

            console.log(`Location ${location.locationDetails.name} has the following ${devices.length} device(s):`);

            for (const device of devices) {
                console.log(`found device: ${device.name} - ${device.zid} (${device.deviceType})`);
                allDevices.push(device);
            }
        }
        console.log(`found ${allDevices.length} devices`);

        // right now this just returns a single 
        return allDevices.filter(device => device.data.deviceType === RingDeviceType.ContactSensor);
    }
}