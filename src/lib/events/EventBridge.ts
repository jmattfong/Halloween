import { CategoryLogger } from "typescript-logging";
import { TRIGGERS } from "../../events";
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

    const sceneFinishedEvent = new NewEvent(scene, "finished");
    let compEventName = eventName;
    if (scene.trigger === TRIGGERS.REPEATING) {
      compEventName = sceneFinishedEvent.fullName();
    }

    if (!this.eventSubscriptions.has(compEventName)) {
      this.eventSubscriptions.set(compEventName, []);
    }

    this.eventSubscriptions.get(compEventName)!!.push(scene);

    if (scene.trigger === TRIGGERS.REPEATING) {
      this.post(sceneFinishedEvent);
    }
  }

  async post(event: NewEvent): Promise<void> {
    log.debug(`Fire event: ${event.fullName()}`);

    const scenesToExecute = this.eventSubscriptions.get(event.fullName()) || [];

    scenesToExecute.forEach((scene) => scene.execute());
  }
}

export const eventBridge = new EventBridgeImpl();
