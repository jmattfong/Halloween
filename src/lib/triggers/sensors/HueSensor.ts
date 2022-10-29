import { HueSensor as HueDevice, HueSensorUpdate } from "../../hue/sensor";
import { Sensor } from "./Sensor";

export class HueSensor extends Sensor {
  constructor(hueDevice: HueDevice) {
    super({ platform: "Hue", name: hueDevice.getId.toString() });
    this.trigger = this.trigger.bind(this);

    hueDevice.addCallback(this.trigger);
  }

  private async trigger(data: HueSensorUpdate): Promise<void> {
    if (data.getPresence()) {
      this.fire("detected");
    } else {
      this.fire("cleared");
    }
  }
}
