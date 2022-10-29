import { hueApi } from "../../../main";
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
    childEffects?: Effect[];
  };
}
export abstract class LightEffect extends Effect {
  readonly lightNames: string[];
  readonly color: Color;
  readonly durationInSeconds: number;
  protected readonly lightApi = hueApi;

  constructor({
    type = "LightEffect",
    name,
    lightNames,
    color,
    delayInSeconds,
    durationInSeconds,
    childEffects,
  }: LightEffect.Params) {
    super({ type, name, delayInSeconds, childEffects });
    this.lightNames = lightNames;
    this.color = color;
    this.durationInSeconds = durationInSeconds;
  }
}
