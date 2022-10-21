import LightState = require("node-hue-api/lib/model/lightstate/LightState");
import { Color } from "../lib/config";
import { LightEffect } from "../lib/scene/effects/LightEffect";
import { createLightState } from "../lib/scene/patterns";

export class StableLightEffect extends LightEffect {
  private readonly on: boolean;
  private readonly transitionMs: number;

  constructor({
    lightName,
    color,
    on,
    delayInSeconds,
    durationInSeconds = 1,
    transitionInSeconds = 0,
  }: StableLightEffect.Params) {
    super({
      name: "StableLightEffect",
      lightName,
      color,
      delayInSeconds,
      durationInSeconds,
    });
    this.on = on;
    this.transitionMs = transitionInSeconds * 1000;
  }

  async perform(): Promise<void> {
    if (this.on) {
      await this.lightApi.setLightState(
        this.lightName,
        createLightState(this.color, this.transitionMs / 10)
      );
    } else {
      await this.lightApi.setLightState(
        this.lightName,
        new LightState().on(false).transitiontime(this.transitionMs / 10)
      );
    }
  }
}

export namespace StableLightEffect {
  export type Params = {
    lightName: string;
    color: Color;
    on: boolean;
    delayInSeconds?: number;
    durationInSeconds?: number;
    transitionInSeconds?: number;
  };
}
