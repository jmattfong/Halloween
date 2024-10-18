import { PathLike, readFileSync } from "fs";

export class SceneConfig {
  version: string;
  scenes: SceneDetails[];
}

export class SceneDetails {
  // the name of the scene
  name: string;

  // the id of the sensor (ex: Waffles' Room)
  sensorId: string;

  // the identifier of the sensor (ex: ring, hue)
  sensorType: string;

  // whether to trigger the scene on fault or not
  // for the ring sensor, faulted is door open and notFaulted is door closed
  // for the hue sensor, faulted is sensed movement
  // if set to null, the scene is triggered on either state
  onFault?: boolean;
}

export function getSceneConfigFromFile(configPath: PathLike = "./ config / scene - config.json"): SceneConfig {
  return JSON.parse(
    readFileSync(configPath, { encoding: "utf-8" }),
  );
}
