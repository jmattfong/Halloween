import Effect from "./effects/Effect";

export default class Scene {
  readonly name: string;
  private readonly effects: Effect[] = [];

  async execute(): Promise<void> {
    this.effects.forEach((effect) => effect.trigger());
  }
}
