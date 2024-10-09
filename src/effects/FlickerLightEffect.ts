import * as LightState from "node-hue-api/lib/model/lightstate/LightState";
import { Color } from "../lib/config";
import { PatternLightEffect } from "../lib/scene/effects/PatternLightEffect";
import { createLightState } from "../lib/hue/light";
import { getRandomInt } from "../lib/random";


export namespace FlickerLightEffect {
  export type Params = {
    lightNames: string[];
    color: Color;
    delayInSeconds?: number;
    durationInSeconds: number;
  };
}
export class FlickerLightEffect extends PatternLightEffect {
  private readonly lightOn = true;

  constructor({
    lightNames,
    color,
    delayInSeconds,
    durationInSeconds,
  }: FlickerLightEffect.Params) {
    super({
      lightNames,
      name: "FlickerLightEffect",
      color,
      delayInSeconds,
      durationInSeconds,
    });
  }

  getNextLightState(): LightState {
    if (this.lightOn) {
      const brightness = getRandomInt(154) + 101;
      return createLightState(this.color, 0, brightness);
    } else {
      return new LightState().on(false).transitiontime(0);
    }
  }

  getTimeToNextTransition(): number {
    return getRandomInt(50) + 10;
  }
}
