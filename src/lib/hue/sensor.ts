import { SpookyHueApi } from "./hue";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
import { getContactSensor } from "./apiv2/contact_sensor";

const log: CategoryLogger = getLogger("hue-sensor");

export abstract class HueSensorUpdate {

  private updateTime: Date;

  constructor(lastUpdatedTime: string) {

    if (!lastUpdatedTime.endsWith("z") && !lastUpdatedTime.endsWith("Z")) {
      lastUpdatedTime += "Z";
    }

    this.updateTime = new Date(lastUpdatedTime);
  }

  public getUpdatedTime(): Date {
    return this.updateTime;
  }

  public isEqual(other: HueSensorUpdate): boolean {
    return (
      this.getUpdatedTime().getTime() === other.getUpdatedTime().getTime()
      && this.getTriggered() === other.getTriggered()
    );
  }

  public toString(): string {
    return `${this.getUpdatedTime()}`;
  }

  abstract getTriggered(): boolean;
}

export class HueContactSensorUpdate extends HueSensorUpdate {
  private contact: boolean;

  constructor(contact: boolean, lastUpdatedTime: string) {
    super(lastUpdatedTime);
    this.contact = contact;
  }

  public getContact(): boolean {
    return this.contact;
  }

  public toString(): string {
    return `${this.getContact()} - ${super.toString()}`;
  }

  public getTriggered(): boolean {
    return !this.getContact();
  }
}

export class HueMotionSensorUpdate extends HueSensorUpdate {
  private presence: boolean;

  constructor(presence: boolean, lastUpdatedTime: string) {
    super(lastUpdatedTime);
    this.presence = presence;
  }

  public getPresence(): boolean {
    return this.presence;
  }

  public toString(): string {
    return `${this.getPresence()} - ${super.toString()}`;
  }

  public getTriggered(): boolean {
    return this.getPresence();
  }
}

export abstract class HueSensor<T extends HueSensorUpdate> {
  private callbacks: ((event: any) => void)[] = new Array();
  private lastSensorUpdate: T | null = null;
  private sensorId: string;

  constructor(sensorId: string) {
    this.sensorId = sensorId;
  }

  public getSensorId(): string {
    return this.sensorId;
  }

  public start() {
    setInterval(
      (() => {
        this.checkForUpdate();
      }).bind(this),
      2000,
    );
  }

  public addCallback(callback: (update: T) => void) {
    log.info("adding callback to sensor");
    this.callbacks.push(callback);
  }

  abstract getSensorUpdate(): Promise<T>;

  private async checkForUpdate() {
    log.debug(`checking for update on sensor ${this.sensorId}`);
    const sensorUpdate = await this.getSensorUpdate();
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
    log.info(`change detected! Invoking callbacks for sensor ${this.getSensorId()} - ${sensorUpdate.toString()}`);
    for (let i = 0; i < this.callbacks.length; i++) {
      const callback = this.callbacks[i];
      callback(sensorUpdate);
    }
  }

  public toString(): string {
    let lastUpdate =
      this.lastSensorUpdate === null
        ? "No Updates"
        : this.lastSensorUpdate.toString();
    return `SensorId: ${this.sensorId} Last Update: ${lastUpdate} # callbacks registered: ${this.callbacks.length}`;
  }
}

export class HueContactSensor extends HueSensor<HueContactSensorUpdate> {

  private hueBridgeIp: string;
  private username: string;

  constructor(sensorId: string, hueBridgeIp: string, username: string) {
    super(sensorId);
    this.hueBridgeIp = hueBridgeIp;
    this.username = username;
  }

  async getSensorUpdate(): Promise<HueContactSensorUpdate> {
    let sensor = await getContactSensor(this.hueBridgeIp, this.username, this.getSensorId());
    log.debug(`Contact Sensor API output: ${JSON.stringify(sensor)}`);
    let contactReport = sensor["data"][0]["contact_report"];
    let sensorContact: boolean = contactReport["state"] === "contact";
    let updateTime: string = contactReport["changed"];
    return new HueContactSensorUpdate(sensorContact, updateTime);
  }
}

export class HueMotionSensor extends HueSensor<HueMotionSensorUpdate> {
  private sensorApi: any;
  private sensorNum: number;

  constructor(api: SpookyHueApi, sensorId: number) {
    super(`${sensorId}`)
    this.sensorApi = api;
    this.sensorNum = sensorId;
  }

  async getSensorUpdate(): Promise<HueMotionSensorUpdate> {
    const sensor = await this.sensorApi.getSensor(this.sensorNum);
    log.debug(`sensor details: ${sensor.toStringDetailed()}`);

    return new HueMotionSensorUpdate(
      sensor.getStateAttributeValue("presence"),
      sensor.lastupdated,
    );
  }

  public getId(): number {
    return this.sensorNum;
  }
}
