import { LightEffect } from "./LightEffect";

export abstract class StableLightEffect extends LightEffect {
  async perform(): Promise<void> {}
}
