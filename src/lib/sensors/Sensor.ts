import { Event, NewEvent } from "../events/Event";
import { eventBridge } from "../events/EventBridge";

export default abstract class Sensor extends Event.Source {
  constructor(name: string, platform: string) {
    super("Sensor", platform, name);
  }

  protected generateAndPostEvent(sensorEventName: string): void {
    eventBridge.post(new NewEvent(this, sensorEventName));
  }
}
