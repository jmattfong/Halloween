import { SpookyHueApi } from "./hue";

export class HueSensorUpdate {
    private presence: boolean
    private updateTime: Date

    constructor(presence: boolean, lastUpdatedTime: string) {
        this.presence = presence;

        if (!lastUpdatedTime.endsWith("z") && lastUpdatedTime.endsWith("Z")) {
            lastUpdatedTime += "Z";
        }

        this.updateTime = new Date(lastUpdatedTime);
    }

    public getPresence(): boolean {
        return this.presence;
    }

    public getUpdatedTime(): Date {
        return this.updateTime;
    }

    public isEqual(other: HueSensorUpdate): boolean {
        return (this.getPresence() === other.getPresence())
            && (this.getUpdatedTime().getTime() === other.getUpdatedTime().getTime());
    }

    public toString(): string {
        return `${this.getPresence()} - ${this.getUpdatedTime()}`
    }
}

export class HueSensor {
    private sensorApi: any
    private sensorId: number
    private callbacks: ((event: any) => void)[]
    private lastSensorUpdate: HueSensorUpdate

    constructor(api: SpookyHueApi, sensorId: number) {
        this.sensorApi = api;
        this.sensorId = sensorId;
        this.lastSensorUpdate = null;
        this.callbacks = new Array();
    }

    public start() {
        setInterval((() => { this.checkForUpdate() }).bind(this), 500);
    }

    private async checkForUpdate() {
        const sensor = await this.sensorApi.get(this.sensorId);
        const sensorUpdate = new HueSensorUpdate(sensor["_stateAttributes"]["presence"], sensor["_stateAttributes"]["lastupdated"]);

        // if no update has occurred in the past (initial setup) store the current state and return
        if (this.lastSensorUpdate === null) {
            this.lastSensorUpdate = sensorUpdate;
            return;
        }

        // if the sensor state is the same, then do nothing 
        if (sensorUpdate.isEqual(this.lastSensorUpdate)) {
            return;
        }

        this.lastSensorUpdate = sensorUpdate;
        for (let i = 0; i < this.callbacks.length; i++) {
            const callback = this.callbacks[i];
            callback(sensorUpdate);
        }
    }

    public addCallback(callback: (update: HueSensorUpdate) => void) {
        console.log('adding callback to sensor');
        this.callbacks.push(callback);
    }

    public toString(): string {
        let lastUpdate = this.lastSensorUpdate === null ? "No Updates" : this.lastSensorUpdate.toString()
        return `SensorId: ${this.sensorId} Last Update: ${lastUpdate} # callbacks registered: ${this.callbacks.length}`;
    }
}