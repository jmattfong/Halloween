import { RingApi, RingDevice, RingDeviceType, RingDeviceData } from "ring-client-api";
import { readFileSync, writeFileSync } from 'fs';
import { getLogger } from './logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("ring")

interface RingConfig {
    username: string
    password: string
    refreshToken: string
}

export class RingEnhancedSpookinatorV2 {
    private ring: RingApi
    private sensors: RingDevice[]
    private configPath: string

    constructor(configPath: string, debug: boolean = false) {
        if (configPath === '') {
            throw new Error('config path must set');
        }
        this.configPath = configPath;
        const fileContents = readFileSync(configPath, { encoding: 'utf-8' })
        let config: RingConfig = JSON.parse(fileContents);
        this.ring = new RingApi({
            cameraStatusPollingSeconds: 2,
            debug: debug,
            refreshToken: config.refreshToken,
        });

        this.ring.onRefreshTokenUpdated.subscribe(
            async ({ newRefreshToken, oldRefreshToken }) => {
                log.info(`Refresh Token Updated: ${newRefreshToken}`);

                // If you are implementing a project that use `ring-client-api`, you should subscribe to onRefreshTokenUpdated and update your config each time it fires an event
                // Here is an example using a .env file for configuration
                if (!oldRefreshToken) {
                    return
                }

                if (newRefreshToken === oldRefreshToken) {
                    log.info("refresh token did not change. Ignoring");
                    return
                }

                const fileContents = readFileSync(this.configPath, { encoding: 'utf-8' })
                let config = JSON.parse(fileContents);
                config["refreshToken"] = newRefreshToken;
                writeFileSync(this.configPath, JSON.stringify(config, null, 2));
            }
        )
        this.sensors = new Array();
    }

    public addSensorCallback(sensor: RingDevice, callback: (data: RingDeviceData) => void): void {
        log.info(`adding callback to sensor ${sensor.name}`)
        sensor.onData.subscribe((event: any) => {
            if ((event as RingDeviceData).name) {
                let data = event as RingDeviceData
                log.info(`sensor ${sensor.name} invoked. event: ${data.faulted}`);
                callback(event);
            } else {
                log.info('an unknown event type was received');
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

            log.info(`Location ${location.locationDetails.name} has the following ${devices.length} device(s):`);

            for (const device of devices) {
                log.info(`found device: ${device.name} - ${device.zid} (${device.deviceType})`);
                allDevices.push(device);
            }
        }
        log.info(`found ${allDevices.length} devices`);

        return allDevices.filter(device => device.data.deviceType === RingDeviceType.ContactSensor);
    }
}