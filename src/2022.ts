import { FlickerLightEffect } from "./effects/FlickerLightEffect";
import { RandomSoundEffect } from "./effects/RandomSoundEffect";
import { Sensors } from "./events";
import { ENERGIZE } from "./lib/config";
import Scene from "./lib/scene/Scene";

export const scenes2022 = [
  new Scene({
    name: "welcome_inside",
    trigger: Sensors.FRONT_DOOR.OPENED,
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
];
