import { FlickerLightEffect } from "../effects/FlickerLightEffect";
import { RandomSoundEffect } from "../effects/RandomSoundEffect";
import { Sensors } from "../events";
import { ENERGIZE } from "../lib/config";
import Scene from "../lib/scene/Scene";
import { SceneCollection } from "./util";

export const scenes2022: SceneCollection = {
  welcome_inside: new Scene({
    name: "welcome_inside",
    trigger: Sensors.RING.FRONT_DOOR.OPENED,
    effects: [
      new RandomSoundEffect({
        soundFiles: [
          "resources/lightning_bolt.mp3",
          "resources/lightning_bolt_2.mp3",
        ],
      }),
      new FlickerLightEffect({
        lightName: "living_room_1",
        color: ENERGIZE,
        durationInSeconds: 3,
      }),
      new FlickerLightEffect({
        lightName: "living_room_2",
        color: ENERGIZE,
        durationInSeconds: 3,
      }),
    ],
  }),
  front_light_flicker: new Scene({
    name: "front_light_flicker",
    trigger: Sensors.HUE.TWO.DETECTED,
    effects: [
      new FlickerLightEffect({
        lightName: "living_room_1",
        color: ENERGIZE,
        durationInSeconds: 7,
      }),
      new FlickerLightEffect({
        lightName: "living_room_2",
        color: ENERGIZE,
        durationInSeconds: 7,
      }),
    ],
  }),
};
