import { ChromecastPlaybackEffect } from "../effects/ChromecastPlaybackEffect";
import { CompoundEffect } from "../effects/CompoundEffect.";
import { FlickerLightEffect } from "../effects/FlickerLightEffect";
import { RandomSoundEffect } from "../effects/RandomSoundEffect";
import { StableLightEffect } from "../effects/StableLightEffect";
import { TRIGGERS } from "../events";
import { ENERGIZE, ORANGE, RED, RELAX } from "../lib/config";
import Scene from "../lib/scene/Scene";
import { INTRO_VIDEO_2022 } from "../lib/videos";
import { SceneCollection } from "./util";

export const scenes2022: SceneCollection = {
  welcome_inside: new Scene({
    name: "welcome_inside",
    trigger: TRIGGERS.SENSORS.RING.FRONT_DOOR.OPENED,
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
    trigger: TRIGGERS.SENSORS.HUE.TWO.DETECTED,
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
    trigger: TRIGGERS.SENSORS.HUE.TWO.DETECTED,
    effects: [
      new ChromecastPlaybackEffect({
        video: INTRO_VIDEO_2022,
      }),
    ],
  }),
  downstairs_bathroom: new Scene({
    name: "downstairs_bathroom",
    trigger: TRIGGERS.SENSORS.RING.WAFFLES_ROOM.OPENED,
    effects: [
      new CompoundEffect({
        childEffects: [
          new FlickerLightEffect({
            color: ENERGIZE,
            durationInSeconds: 5,
            lightNames: ["downbath_1", "downbath_2"],

          })
        ]
      })
    ]
  }),
  photobooth_thunder: new Scene({
    name: "photobooth_thunder",
    trigger: TRIGGERS.SENSORS.RING.FRONT_GATE.OPENED,
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
  halloween_hallway: new Scene({
    name: "halloween_hallway",
    trigger: TRIGGERS.REPEATING,
    effects: [
      new StableLightEffect({
        lightNames: ["halloween_hallway_1"],
        color: ORANGE,
        on: true,
        durationInSeconds: 1.5,
        transitionInSeconds: 1,
        childEffects: [
          new StableLightEffect({
            lightNames: ["halloween_hallway_1"],
            color: ORANGE,
            on: false,
            durationInSeconds: 1,
          }),
          new StableLightEffect({
            lightNames: ["halloween_hallway_2"],
            color: ORANGE,
            on: true,
            durationInSeconds: 1.5,
            transitionInSeconds: 1,
            childEffects: [
              new StableLightEffect({
                lightNames: ["halloween_hallway_2"],
                color: ORANGE,
                on: false,
                durationInSeconds: 1,
              }),
              new StableLightEffect({
                lightNames: ["halloween_hallway_3"],
                color: ORANGE,
                on: true,
                durationInSeconds: 1.5,
                transitionInSeconds: 1,
                childEffects: [
                  new StableLightEffect({
                    lightNames: ["halloween_hallway_3"],
                    color: ORANGE,
                    on: false,
                    durationInSeconds: 1,
                  }),
                  new StableLightEffect({
                    lightNames: ["halloween_hallway_4"],
                    color: ORANGE,
                    on: true,
                    durationInSeconds: 1.5,
                    transitionInSeconds: 1,
                    childEffects: [
                      new StableLightEffect({
                        lightNames: ["halloween_hallway_4"],
                        color: ORANGE,
                        on: false,
                        delayInSeconds: 5.5,
                        durationInSeconds: 1,
                      }),
                      new StableLightEffect({
                        lightNames: ["halloween_hallway_5"],
                        color: ORANGE,
                        on: true,
                        durationInSeconds: 1.5,
                        transitionInSeconds: 1,
                        childEffects: [
                          new StableLightEffect({
                            lightNames: ["halloween_hallway_5"],
                            color: ORANGE,
                            on: false,
                            durationInSeconds: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  look_its_waffles: new Scene({
    name: "look_its_waffles",
    trigger: TRIGGERS.SENSORS.RING.FRONT_GATE.OPENED,
    effects: [
      new CompoundEffect({
        delayInSeconds: 5,
        childEffects: [
          new RandomSoundEffect({
            soundFiles: ["resources/alien_creature.mp3"],
          }),
          new StableLightEffect({
            lightNames: ["living_room_3"],
            color: RED,
            on: true,
            durationInSeconds: 15,
            childEffects: [
              new StableLightEffect({
                lightNames: ["living_room_3"],
                color: RED,
                on: false,
                delayInSeconds: 20,
                transitionInSeconds: 1,
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  guest_bed_clown: new Scene({
    name: "guest_bed_clown",
    trigger: TRIGGERS.SENSORS.RING.FRONT_GATE.OPENED,
    effects: [
      new CompoundEffect({
        delayInSeconds: 7,
        childEffects: [
          new RandomSoundEffect({
            soundFiles: [
              "resources/saw_laugh.mp3",
              "resources/creepy_child.mp3",
            ],
          }),
          new StableLightEffect({
            lightNames: ["master_1", "master_2", "master_3", "master_4"],
            color: ENERGIZE,
            on: false,
            durationInSeconds: 14,
            childEffects: [
              new StableLightEffect({
                lightNames: ["master_1", "master_2", "master_3", "master_4"],
                color: RELAX,
                on: true,
                durationInSeconds: 1,
              }),
            ],
          }),
        ],
      }),
    ],
  }),
};
