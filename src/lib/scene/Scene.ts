import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../logging";
import Effect from "./effects/Effect";

const log: CategoryLogger = getLogger("scene");

export default class Scene {
  readonly name: string;
  private readonly effects: Effect[] = [];

  async execute(): Promise<void> {
    log.debug(`Starting scene: ${this.name}...`);

    this.effects.forEach((effect) => effect.trigger());
  }
}
