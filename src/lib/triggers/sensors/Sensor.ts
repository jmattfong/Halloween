import { Trigger } from "../Trigger";

export namespace Sensor {
  export type Params = {
    name: string;
    platform: string;
  };
}
export abstract class Sensor extends Trigger {
  constructor({ name, platform }: Sensor.Params) {
    super({
      type: "Sensor",
      name,
      platform,
    });
  }
}
