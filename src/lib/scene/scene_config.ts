import { PathLike, readFileSync } from "fs";

export class SceneConfig {
  version: string;
  scenes: SceneDetails[];
}

export class SceneDetails {
  name: string;
  sensorId: string;
  sensorType: string;
  onFault?: boolean;
}

export function getSceneConfigFromFile(configPath: PathLike = "./ config / scene - config.json"): SceneConfig {
  return JSON.parse(
    readFileSync(configPath, { encoding: "utf-8" }),
  );
}
