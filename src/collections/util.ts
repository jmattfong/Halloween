import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../lib/logging";
import { CLIEffect } from "../lib/scene/effects/CLIEffect";
import Scene from "../lib/scene/Scene";
import { hueApi } from "../main";

const log: CategoryLogger = getLogger("util_scenes");

export type SceneCollection = {
  [n: string]: Scene;
};
export const util_scenes: SceneCollection = {
  list: new Scene({
    name: "list",
    trigger: "InputTrigger-Local-[l]-pressed",
    effects: [
      new CLIEffect({
        name: "list_lights",
        txtGen: async () => {
          const allLights = await hueApi.getLights();

          let lights: Object[] = [];

          for (let i = 0; i < allLights.length; i++) {
            let light = allLights[i];
            let on = light["_data"]["state"]["on"];
            let reachable = light["_data"]["state"]["reachable"];
            if (on && reachable) {
              log.info(`Light is on: ${JSON.stringify(light)}`);

              let light_config = {
                id: light["_data"]["id"],
                type: light["_data"]["type"],
                name: light["_data"]["name"],
                productname: light["_data"]["productname"],
              };
              lights.push(light_config);
            }
          }

          log.info(
            `Light config for ON and REACHABLE lights:\n ${JSON.stringify(
              lights
            )}`
          );
        },
      }),
    ],
  }),
};
