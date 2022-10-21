import { Event, NewEvent } from "../events/Event";
import { eventBridge } from "../events/EventBridge";

export namespace Trigger {
  export type Params = {
    type?: string;
    name: string;
    platform?: string;
  };
}
export abstract class Trigger extends Event.Source {
  constructor({ type = "Trigger", name, platform = "Local" }: Trigger.Params) {
    super(type, platform, name);
  }

  protected fire(sensorEventName: string = "fired"): void {
    eventBridge.post(new NewEvent(this, sensorEventName));
  }
}
