import { ChromecastPlaybackEffect } from "../effects/ChromecastPlaybackEffect";
import { FlickerLightEffect } from "../effects/FlickerLightEffect";
import { RandomSoundEffect } from "../effects/RandomSoundEffect";
import { StableLightEffect } from "../effects/StableLightEffect";
import { Sensors } from "../events";
import { ENERGIZE, RED, RELAX } from "../lib/config";
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
  guest_bed_clown: new Scene({
    name: "guest_bed_clown",
    trigger: Sensors.RING.FRONT_GATE.OPENED,
    effects: [
      new RandomSoundEffect({
        soundFiles: ["resources/saw_laugh.mp3", "resources/creepy_child.mp3"],
        delayInSeconds: 7,
      }),
      new StableLightEffect({
        lightNames: ["master_1", "master_2", "master_3", "master_4"],
        color: ENERGIZE,
        on: false,
        delayInSeconds: 7,
        durationInSeconds: 14,
      }),
      new StableLightEffect({
        lightNames: ["master_1", "master_2", "master_3", "master_4"],
        color: RELAX,
        on: true,
        delayInSeconds: 21,
      }),
    ],
  }),
};
