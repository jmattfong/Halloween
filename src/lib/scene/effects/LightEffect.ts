import { HueApi } from "node-hue-api";
import { Color } from "../../config";
import { Effect } from "./Effect";

export namespace LightEffect {
  export type Params = {
    type?: string;
    name: string;
    lightNames: string[];
    color: Color;
    delayInSeconds?: number;
    durationInSeconds: number;
  };
}
export abstract class LightEffect extends Effect {
  readonly lightNames: string[];
  readonly color: Color;
  readonly durationInSeconds: number;
  protected readonly lightApi = HueApi;

  constructor({
    type = "LightEffect",
    name,
    lightNames,
    color,
    delayInSeconds,
    durationInSeconds,
  }: LightEffect.Params) {
    super({ type, name, delayInSeconds });
    this.lightNames = lightNames;
    this.color = color;
    this.durationInSeconds = durationInSeconds;
  }
}
