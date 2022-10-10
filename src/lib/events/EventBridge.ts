import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../logging";
import Scene from "../scene/Scene";
import { NewEvent } from "./Event";

const log: CategoryLogger = getLogger("event-bridge");

export interface EventBridge {
  register(eventName: string, scene: Scene): void;
  post(event: NewEvent): Promise<void>;
}

class EventBridgeImpl implements EventBridge {
  private readonly eventSubscriptions: Map<string, Scene[]> = new Map();

  register(eventName: string, scene: Scene): void {
    log.debug(`Scene: ${scene.name} === subscribed to === ${eventName}`);

    if (!this.eventSubscriptions.has(eventName)) {
      this.eventSubscriptions.set(eventName, []);
    }

    this.eventSubscriptions.get(eventName)!!.push(scene);
  }

  async post(event: NewEvent): Promise<void> {
    log.debug(`Fire event: ${event.fullName()}`);

    const scenesToExecute = this.eventSubscriptions.get(event.fullName()) || [];

    scenesToExecute.forEach((scene) => scene.execute());
  }
}

export const eventBridge = new EventBridgeImpl();
