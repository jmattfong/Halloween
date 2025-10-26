import { readFileSync } from "fs";
import { HueContactSensor, HueMotionSensor, HueSensor } from "./sensor";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
import {
  listContactSensors,
  getContactSensor,
 } from "./apiv2/contact_sensor";

const log: CategoryLogger = getLogger("hue");

const v3 = require("node-hue-api").v3;

interface HueSecrets {
  hueUsername: string;
}

export class SpookyHueApi {
  private hueApi: any;
  private isConnected: boolean = false;
  // username is also known as the hue "application key" in their APIv2
  // See https://developers.meethue.com/develop/hue-api-v2/getting-started/
  // See https://developers.meethue.com/develop/hue-api-v2/api-reference/
  private username: string;
  private lights: any;
  private bridgeIp: string;

  constructor(secretsPath: string, config: any) {
    if (secretsPath === "") {
      throw new Error("config path must set");
    }
    const fileContents = readFileSync(secretsPath, { encoding: "utf-8" });
    const secrets: HueSecrets = JSON.parse(fileContents);
    this.username = secrets.hueUsername;
  }

  public async connect() {
    if (this.isConnected) {
      return;
    }
    let searchResults = await v3.discovery.nupnpSearch();
    log.info(
      `found ${searchResults.length} hubs. Connecting to the first one cuz #yolo`,
    );
    const host = searchResults[0].ipaddress;
    this.connectUsingIP(host);
  }

  public async connectUsingIP(host: string) {
    if (this.isConnected) {
      return;
    }
    this.bridgeIp = host;
    log.info(`connecting to ${host}`);
    this.hueApi = await v3.api.createLocal(host).connect(this.username);
    log.info("connected!");
    this.isConnected = true;
  }

  public getIsConnected() {
    return this.isConnected;
  }

  public async setLightState(lightName: string, state: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error("not connected to the hue hub");
    }

    try {
      await this.hueApi.lights.setLightState(this.getLightId(lightName), state);
    } catch (e) {
      log.debug(`Error setting light state: ${e}`);
    }
  }

  public getLightId(name: string): number {
    return +name;
  }

  public async getLights(): Promise<any> {
    if (!this.isConnected) {
      throw new Error("not connected to the hue hub");
    }
    return await this.hueApi.lights.getAll();
  }

  public async getSensor(sensorId: number): Promise<HueMotionSensor> {
    if (!this.isConnected) {
      throw new Error("not connected to the hue hub");
    }
    const sensor = await this.hueApi.sensors.getSensor(sensorId);
    return new HueMotionSensor(this.hueApi.sensors, sensor.id);
  }

  public async getContactSensors(): Promise<HueContactSensor[]> {
    if (!this.isConnected) {
      throw new Error("not connected to the hue hub");
    }

    let sensors = await listContactSensors(this.bridgeIp, this.username);
    return sensors["data"].map((s) => {
      let sensorId = s["id"];
      log.info(`Adding contact sensor -> ${sensorId}`);
      return new HueContactSensor(sensorId, this.bridgeIp, this.username);
    });
  }

  public async getMotionSensors(): Promise<HueMotionSensor[]> {
    if (!this.isConnected) {
      throw new Error("not connected to the hue hub");
    }

    let sensors = await this.hueApi.sensors.getAll();    

    return sensors
      .filter((sensor: any) => {
        log.info(
          `Checking sensor ${sensor.name} -> ${sensor.type} -> ${sensor.id}}`,
        );
        // currently we are only returning presence sensors, but we can also update this
        // to get temperature, ambient light, and other spooky sensors
        return String(sensor.type) == "ZLLPresence";
      })
      .map((sensor: any) => {
        log.debug(
          `Adding sensor ${sensor.name} -> ${sensor.type} -> ${sensor.id}}`,
        );
        return new HueMotionSensor(this.hueApi.sensors, sensor.id);
      });
  }

  public async getSensors(): Promise<HueSensor<any>[]> {
    let motion: HueSensor<any>[] = await this.getMotionSensors();
    let allSensors = motion.concat(await this.getContactSensors());
    log.debug(`Got ${allSensors.length} sensors, bitch`);
    return allSensors;
  }
}
