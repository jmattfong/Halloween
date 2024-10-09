import { readFileSync } from "fs";
import { HueSensor } from "./sensor";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";

const log: CategoryLogger = getLogger("hue");

const v3 = require("node-hue-api").v3;

interface HueSecrets {
  hueUsername: string;
}

export class SpookyHueApi {
  private hueApi: any;
  private isConnected: boolean = false;
  private username: string;
  private lights: any;

  constructor(secretsPath: string, config: any) {
    if (secretsPath === "") {
      throw new Error("config path must set");
    }
    const fileContents = readFileSync(secretsPath, { encoding: "utf-8" });
    const secrets: HueSecrets = JSON.parse(fileContents);
    this.username = secrets.hueUsername;
    this.lights = config["lights"];
    log.info("got lights " + JSON.stringify(this.lights));
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
    return this.lights[name];
  }

  public async getLights(): Promise<any> {
    if (!this.isConnected) {
      throw new Error("not connected to the hue hub");
    }
    return await this.hueApi.lights.getAll();
  }

  public async getSensor(sensorId: number): Promise<HueSensor> {
    if (!this.isConnected) {
      throw new Error("not connected to the hue hub");
    }
    const sensor = await this.hueApi.sensors.getSensor(sensorId);
    return new HueSensor(this.hueApi.sensors, sensor.id);
  }

  public async getSensors(): Promise<HueSensor[]> {
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
        return new HueSensor(this.hueApi.sensors, sensor.id);
      });
  }
}
