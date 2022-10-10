import { readFileSync } from "fs";
import { RingDevice, RingDeviceData } from "ring-client-api";
import { RingEnhancedSpookinatorV2 } from "../ring";
import Sensor from "./Sensor";

const configContents = readFileSync("./config/config.json", {
  encoding: "utf-8",
});
const config = JSON.parse(configContents);
export const ringApi = new RingEnhancedSpookinatorV2(config.secretPath, true);

export default class RingSensor extends Sensor {
  constructor(ringDevice: RingDevice) {
    super("Ring", ringDevice.name);
    this.trigger = this.trigger.bind(this);

    ringApi.addSensorCallback(ringDevice, this.trigger);
  }

  private async trigger(data: RingDeviceData): Promise<void> {
    if (data.faulted) {
      super.generateAndPostEvent("faulted");
    }
  }
}
