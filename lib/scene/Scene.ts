import Effect from "./effects/EffectAbstract";

export default class Scene {
  readonly name: string;
  private readonly effects: Effect[] = [];

  async execute(): Promise<void> {
    this.effects.forEach((effect) => effect.trigger());
  }
}
