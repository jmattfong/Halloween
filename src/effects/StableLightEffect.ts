import LightState = require("node-hue-api/lib/model/lightstate/LightState");
import { Color } from "../lib/config";
import { LightEffect } from "../lib/scene/effects/LightEffect";
import { createLightState } from "../lib/scene/patterns";

export class StableLightEffect extends LightEffect {
  private readonly on: boolean;
  private readonly transitionMs: number;

  constructor({
    lightNames,
    color,
    on,
    delayInSeconds,
    durationInSeconds = 1,
    transitionInSeconds = 0,
  }: StableLightEffect.Params) {
    super({
      name: "StableLightEffect",
      lightNames,
      color,
      delayInSeconds,
      durationInSeconds,
    });
    this.on = on;
    this.transitionMs = transitionInSeconds * 1000;
  }

  async perform(): Promise<void> {
    await Promise.all(
      this.lightNames.map(async (lightName) => {
        if (this.on) {
          await this.lightApi.setLightState(
            lightName,
            createLightState(this.color, this.transitionMs / 10)
          );
        } else {
          await this.lightApi.setLightState(
            lightName,
            new LightState().on(false).transitiontime(this.transitionMs / 10)
          );
        }
      })
    );
  }
}

export namespace StableLightEffect {
  export type Params = {
    lightNames: string[];
    color: Color;
    on: boolean;
    delayInSeconds?: number;
    durationInSeconds?: number;
    transitionInSeconds?: number;
  };
}
