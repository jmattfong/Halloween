import { hueApi } from "../../../main";
import { Color } from "../../config";
import { Effect } from "./Effect";

export namespace LightEffect {
  export type Params = {
    type?: string;
    name: string;
    lightName: string;
    color: Color;
    delayInSeconds?: number;
    durationInSeconds: number;
  };
}
export abstract class LightEffect extends Effect {
  readonly lightName: string;
  readonly color: Color;
  readonly durationInSeconds: number;
  protected readonly lightApi = hueApi;

  constructor({
    type = "LightEffect",
    name,
    lightName,
    color,
    delayInSeconds,
    durationInSeconds,
  }: LightEffect.Params) {
    super({ type, name, delayInSeconds });
    this.lightName = lightName;
    this.color = color;
    this.durationInSeconds = durationInSeconds;
  }
}
