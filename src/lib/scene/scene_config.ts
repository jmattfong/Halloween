import { PathLike, readFileSync } from "fs";

export class SceneConfig {
  version: string;
  scenes: SceneDetails[];
}

export class SceneDetails {
  name: string;
  sensorId: string;
  sensorType: string;
}

export function getSceneConfigFromFile(configPath: PathLike): SceneConfig {
  return JSON.parse(
    readFileSync("./config/scene-config.json", { encoding: "utf-8" }),
  );
}
