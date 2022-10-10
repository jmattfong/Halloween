import { Event, NewEvent } from "../events/Event";
import EventBridge from "../events/EventBridge";

export default abstract class Sensor extends Event.Source {
  private readonly eventBridge: EventBridge;

  constructor(eventBridge: EventBridge, name: string, platform: string) {
    super("Sensor", platform, name);
    this.eventBridge = eventBridge;
  }

  protected generateAndPostEvent(sensorEventName: string): void {
    this.eventBridge.post(new NewEvent(this, sensorEventName));
  }
}
