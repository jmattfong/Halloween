import EventBridge from "../events/EventBridge";
import Sensor from "./Sensor";

export default class RingSensor extends Sensor {
  constructor(eventBridge: EventBridge, name: string) {
    super(eventBridge, "Ring", name);
  }
}
