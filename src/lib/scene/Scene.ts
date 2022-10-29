import { CategoryLogger } from "typescript-logging";
import { Event, NewEvent } from "../events/Event";
import { eventBridge } from "../events/EventBridge";
import { getLogger } from "../logging";
import { Effect } from "./effects/Effect";

const log: CategoryLogger = getLogger("scene");

export namespace Scene {
  export type Params = {
    name: string;
    trigger: string;
    effects: Effect[];
  };
}
export default class Scene extends Event.Source {
  readonly name: string;
  readonly trigger: string;
  private readonly effects: Effect[] = [];

  constructor({ name, trigger, effects }: Scene.Params) {
    super("Scene", "Scene", name);
    this.execute = this.execute.bind(this);

    this.name = name;
    this.trigger = trigger;
    this.effects = effects;

    this.setup();
  }

  setup(): void {
    eventBridge.register(this.trigger, this);
  }

  async execute(): Promise<void> {
    log.debug(`Starting scene: ${this.name}...`);
    eventBridge.post(new NewEvent(this, "started"));

    await Promise.all(this.effects.map((effect) => effect.trigger()));

    eventBridge.post(new NewEvent(this, "finished"));
  }
}
