import Scene from "../scene/Scene";
import { NewEvent } from "./Event";

export default class EventBridge {
  private readonly eventSubscriptions: Map<string, Scene[]> = new Map();

  register(eventName: string, scene: Scene): void {
    if (!this.eventSubscriptions.has(eventName)) {
      this.eventSubscriptions.set(eventName, []);
    }

    this.eventSubscriptions.get(eventName)?.push(scene);
  }

  async post(event: NewEvent): Promise<void> {
    const scenesToExecute = this.eventSubscriptions.get(event.fullName()) || [];

    scenesToExecute.forEach((scene) => scene.execute());
  }
}
