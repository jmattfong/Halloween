import { Effect } from "../lib/scene/effects/Effect";

export class CompoundEffect extends Effect {
  constructor({ delayInSeconds = 0, childEffects }) {
    super({
      type: "Compound",
      name: "Compound",
      delayInSeconds,
      childEffects,
    });
  }

  protected async perform(): Promise<void> {}
}

export namespace CompoundEffect {
  export type Params = {
    delayInSeconds?: number;
    childEffects: Effect[];
  };
}
