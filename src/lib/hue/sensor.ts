import { SpookyHueApi } from "./hue";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";

const log: CategoryLogger = getLogger("hue-sensor");

export class HueSensorUpdate {
  private presence: boolean;
  private updateTime: Date;

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
    return (
      this.getPresence() === other.getPresence() &&
      this.getUpdatedTime().getTime() === other.getUpdatedTime().getTime()
    );
  }

  public toString(): string {
    return `${this.getPresence()} - ${this.getUpdatedTime()}`;
  }
}

export class HueSensor {
  private sensorApi: any;
  private sensorId: number;
  private callbacks: ((event: any) => void)[];
  private lastSensorUpdate: HueSensorUpdate | null;

  constructor(api: SpookyHueApi, sensorId: number) {
    this.sensorApi = api;
    this.sensorId = sensorId;
    this.lastSensorUpdate = null;
    this.callbacks = new Array();
  }

  public start() {
    setInterval(
      (() => {
        this.checkForUpdate();
      }).bind(this),
      2000,
    );
  }

  private async checkForUpdate() {
    log.debug(`checking for update on sensor ${this.sensorId}`);
    const sensor = await this.sensorApi.getSensor(this.sensorId);

    log.debug(`sensor details: ${sensor.toStringDetailed()}`);
    const sensorUpdate = new HueSensorUpdate(
      sensor.getStateAttributeValue("presence"),
      sensor.lastupdated,
    );
    log.debug(`sensor update: ${JSON.stringify(sensorUpdate, null, 4)}`);

    // if no update has occurred in the past (initial setup) store the current state and return
    if (this.lastSensorUpdate === null) {
      log.info(`first update on ${this.sensorId}. Returning`);
      this.lastSensorUpdate = sensorUpdate;
      return;
    }

    // if the sensor state is the same, then do nothing
    if (sensorUpdate.isEqual(this.lastSensorUpdate)) {
      log.debug(`no change on sensor state on ${this.sensorId}. Returning`);
      return;
    }

    this.lastSensorUpdate = sensorUpdate;
    log.info(`change detected! Invoking callbacks`);
    for (let i = 0; i < this.callbacks.length; i++) {
      const callback = this.callbacks[i];
      callback(sensorUpdate);
    }
  }

  public addCallback(callback: (update: HueSensorUpdate) => void) {
    log.info("adding callback to sensor");
    this.callbacks.push(callback);
  }

  public getId(): number {
    return this.sensorId;
  }

  public toString(): string {
    let lastUpdate =
      this.lastSensorUpdate === null
        ? "No Updates"
        : this.lastSensorUpdate.toString();
    return `SensorId: ${this.sensorId} Last Update: ${lastUpdate} # callbacks registered: ${this.callbacks.length}`;
  }
}
