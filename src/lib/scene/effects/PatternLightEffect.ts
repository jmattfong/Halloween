import LightState = require("node-hue-api/lib/model/lightstate/LightState");
import { Color } from "../../config";
import { sleep } from "../patterns";
import { LightEffect } from "./LightEffect";

export namespace PatternLightEffect {
  export type Params = {
    type?: string;
    name: string;
    color: Color;
    delayInSeconds?: number;
    durationInSeconds: number;
  };
}
export abstract class PatternLightEffect extends LightEffect {
  abstract getNextLightState(): LightState;
  abstract getTimeToNextTransition(): number;

  async perform(): Promise<void> {
    const startTime = new Date();
    const durationMs = this.durationInSeconds * 1000;

    while (true) {
      const currTime = new Date();
      if (currTime.getTime() - startTime.getTime() > durationMs) {
        return;
      }

      await this.lightApi.setLightState(
        this.lightName,
        this.getNextLightState()
      );

      await sleep(this.getTimeToNextTransition());
    }
  }
}
