import { RingDevice, RingDeviceData } from "ring-client-api";
import { ringApi } from "../../../main";
import { Sensor } from "./Sensor";

export default class RingSensor extends Sensor {
  constructor(ringDevice: RingDevice) {
    super({ platform: "Ring", name: ringDevice.name });
    this.trigger = this.trigger.bind(this);

    ringApi.addSensorCallback(ringDevice, this.trigger);
  }

  private async trigger(data: RingDeviceData): Promise<void> {
    if (data.faulted) {
      this.fire("opened");
    } else {
      this.fire("closed");
    }
  }
}
