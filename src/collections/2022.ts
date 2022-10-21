import { ChromecastPlaybackEffect } from "../effects/ChromecastPlaybackEffect";
import { FlickerLightEffect } from "../effects/FlickerLightEffect";
import { RandomSoundEffect } from "../effects/RandomSoundEffect";
import { StableLightEffect } from "../effects/StableLightEffect";
import { Sensors } from "../events";
import { ENERGIZE, RED } from "../lib/config";
import Scene from "../lib/scene/Scene";
import { INTRO_VIDEO_2022 } from "../lib/videos";
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
        lightNames: ["living_room_1", "living_room_2"],
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
        lightNames: ["living_room_1", "living_room_2"],
        color: ENERGIZE,
        durationInSeconds: 7,
      }),
    ],
  }),
  front_door_video: new Scene({
    name: "front_door_video",
    trigger: Sensors.HUE.TWO.DETECTED,
    effects: [
      new ChromecastPlaybackEffect({
        video: INTRO_VIDEO_2022,
      }),
    ],
  }),
  photobooth_thunder: new Scene({
    name: "photobooth_thunder",
    trigger: Sensors.RING.FRONT_GATE.OPENED,
    effects: [
      new RandomSoundEffect({
        soundFiles: [
          "resources/lightning_bolt.mp3",
          "resources/lightning_bolt_2.mp3",
        ],
      }),
      new FlickerLightEffect({
        lightNames: ["living_room_1", "living_room_2"],
        color: ENERGIZE,
        durationInSeconds: 3,
      }),
    ],
  }),
  look_its_waffles: new Scene({
    name: "look_its_waffles",
    trigger: Sensors.RING.FRONT_GATE.OPENED,
    effects: [
      new RandomSoundEffect({
        soundFiles: ["resources/alien_creature.mp3"],
        delayInSeconds: 5,
      }),
      new StableLightEffect({
        lightNames: ["living_room_3"],
        color: RED,
        on: true,
        delayInSeconds: 5,
        durationInSeconds: 15,
      }),
      new StableLightEffect({
        lightNames: ["living_room_3"],
        color: RED,
        on: false,
        delayInSeconds: 20,
        transitionInSeconds: 1,
      }),
    ],
  }),
};
