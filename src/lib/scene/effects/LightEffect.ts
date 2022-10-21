import { readFileSync } from "fs";
import { CategoryLogger } from "typescript-logging";
import { Color } from "../../config";
import { SpookyHueApi } from "../../hue/hue";
import { getLogger } from "../../logging";
import { Effect } from "./Effect";

const log: CategoryLogger = getLogger("light-effect");

const configContents = readFileSync("./config/config.json", {
  encoding: "utf-8",
});
const config = JSON.parse(configContents);
export const lightApi = new SpookyHueApi(config.secretPath, config);
(async () => {
  await lightApi.connectUsingIP(config.hue_bridge_ip);
  log.debug(
    `get all lights: ${(await lightApi.getLights()).map((l: any) =>
      l.toStringDetailed()
    )}`
  );
})();

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
  protected readonly lightApi = lightApi;

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
