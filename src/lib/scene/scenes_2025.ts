import { Chromecaster } from "../chromecast";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
import { SpookyHueBulbPlayer } from "../hue/spooky_bulb_player";
import {
  SoundPattern,
  RandomSoundPattern,
  FlickerPattern,
  OffPattern,
  SleepPattern,
  OnPattern,
  Pattern,
  PulsePattern,
  StableColourPattern,
  sleep,
  RandomColourPattern,
  NoSoundPattern,
} from "./patterns";
import { Event } from "./events";
import {
  Scene,
  RandomMultiScene,
  MultiPartScene,
  AutoResetRingScene,
} from "./scenes";
import { VIDEOS_2023, PORTAL_TO_HELL } from "../videos";
import {
  Color,
  GREEN,
  DARK_GREEN,
  RED,
  LAVENDER,
  SOFT_LAVENDER,
  SOFT_RED,
  RELAX,
  BLUE,
  ORANGE,
  PURPLE,
  YELLOW,
  ENERGIZE,
} from "../config";
import { SensorType } from "../web_listener/webserver";
import {
  ListOnLightsScene,
  SetLightColor,
  LoopThroughAllLights,
  CycleColors,
  GetLight,
  FindBulb,
} from "./util_scenes";
import {
  getLights,
  front_patio,
  foyer,
  living_room,
  primary_bedroom,
  dining_room,
  reading_lamp,
  upstairs_hallway,
  kitchen,
  upstairs_bathroom,
  staircase,
  media_room,
  the_lady_hole,
  water_heater,
  downstairs_hallway,
  downstairs_bedroom,
  downstairs_bathroom,
  garage,
  power_switch,
  werewolf_scene,
  clown_room,
  halloween_hallway,
  photobooth_spooks,
  workout_room,
} from "./locations_brandon";

const log: CategoryLogger = getLogger("scenes_2025");

const RESOURCES_DIR: String = "resources/all-sounds";

const DEFAULT_LIGHTING: Pattern = new OnPattern(RELAX, 3);

function getUnspookyEvents(lights: string[]) {
  return lights.map((light) => {
    return new Event(light, DEFAULT_LIGHTING);
  });
}

class ThunderScene extends MultiPartScene {
  constructor(lights: string[]) {
    let events: Event[] = lights.map((light) => {
      return new Event(
        light,
        new RandomSoundPattern(
          [
            `${RESOURCES_DIR}/thunder/david_thunder_and_clowns.mp3`,
            `${RESOURCES_DIR}/thunder/david_thunder.mp3`,
            `${RESOURCES_DIR}/thunder/lightning_bolt.mp3`,
            `${RESOURCES_DIR}/thunder/lightning_bolt_2.mp3`,
            `${RESOURCES_DIR}/thunder/thunder_sound_1.mp3`,
            `${RESOURCES_DIR}/thunder/thunder_sound_2.mp3`,
          ],
          new FlickerPattern(3),
        ),
        new StableColourPattern(RELAX, 30, 13, 4),
      );
    });
    super(events, getUnspookyEvents(lights));
  }
}

class ElectricLady extends MultiPartScene {
  /// We attach the sound to the last light in the list so only one sound plays
  /// at a time
  constructor(lights: string[]) {
    var events: Event[] = lights.slice(0, -1).map((light) => {
      log.info(`my LIGHT: ${light}`);
      return new Event(
        light,
        new FlickerPattern(3),
        new OffPattern(1),
        new StableColourPattern(RED, 60, 30, 0),
        new OnPattern(SOFT_RED, 10),
      );
    });
    log.info(`other LIGHT: ${lights[lights.length - 1]}`);
    events.push(
      new Event(
        lights[lights.length - 1],
        new SoundPattern(
          `${RESOURCES_DIR}/electric_lady/sparks.mp3`,
          new FlickerPattern(4),
          0,
        ),
        new SoundPattern(
          `${RESOURCES_DIR}/electric_lady/woman_screaming.mp3`,
          new StableColourPattern(RED, 15, 30, 0),
          0.5,
          1,
          true,
        ),
        new OnPattern(SOFT_RED, 10),
      ),
    );

    super(events, getUnspookyEvents(lights));
  }
}

class FrontLightFlickerScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let events: Event[] = lights.map((light) => {
      return new Event(
        light,
        new FlickerPattern(7, { bri: 50 }),
        DEFAULT_LIGHTING,
      );
    });
    super(events, true);
  }
}

class DownstairsBathCreepyClownShowerScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let lightsClone = lights.slice();
    let showerLight = lightsClone.pop();

    let spookyEvents: Event[] = lightsClone.map((light) => {
      return new Event(
        light,
        new SleepPattern(0.0125),
        new FlickerPattern(5),
        new OnPattern(RELAX, 5, 5),
        new OffPattern(1, 5),
        new SleepPattern(13),
        new FlickerPattern(3),
        new OnPattern(SOFT_RED, 1, 10),
      );
    });

    spookyEvents.push(
      new Event(
        showerLight,
        new SoundPattern(
          `${RESOURCES_DIR}/david_bathroom_clowns_pop.mp3`,
          new OnPattern(RED, 10, 5),
          10,
          1,
          true,
        ),
        new OffPattern(1),
      ),
    );

    super(spookyEvents, false);
  }
}

// Song is 161 seconds long
class CalmingCockroachesScene extends MultiPartScene {
  constructor(lights: string[]) {
    let spookyEvents = [
      new Event(
        lights[1],
        new SoundPattern(
          `${RESOURCES_DIR}/calming_cockroaches/enya_bugs.mp3`,
          new OnPattern(LAVENDER, 6, 5),
          0,
          1,
          true,
        ),
        new OnPattern(DARK_GREEN, 6, 30),
      ),
      new Event(
        lights[0],
        new OnPattern(LAVENDER, 6, 5),
        new OnPattern(DARK_GREEN, 6, 30),
      ),
    ];

    const unspookyEvents = lights.map((light) => {
      return new Event(
        light,
        new NoSoundPattern(new OnPattern(SOFT_LAVENDER, 6, 5)),
      );
    });

    super(spookyEvents, unspookyEvents, false);
  }
}

class HalloweenHallway extends AutoResetRingScene {
  constructor(lights: string[]) {
    // TODO this was copied from 2022 and needs to be reworked
    let events: Event[];
    super(events, true);
  }
  getRepeatingEvents(lights: string[]): Event[] {
    let eventLights: string[][] = [[], [], [], [], []];
    let i = 0;
    lights.forEach((light) => {
      eventLights[i].push(light);
      i = ++i % eventLights.length;
    });

    log.info(`eventLights: ${JSON.stringify(eventLights)}`);

    let result = eventLights[0].map((light) => {
      return new Event(
        light,
        new OnPattern(ORANGE, 1.5, 1),
        new OffPattern(1),
        new OffPattern(1),
        new OffPattern(1),
        new OffPattern(1),
      );
    });
    result = result.concat(
      eventLights[1].map((light) => {
        return new Event(
          light,
          new OffPattern(1),
          new OnPattern(ORANGE, 1.5, 1),
          new OffPattern(1),
          new OffPattern(1),
          new OffPattern(1),
        );
      }),
    );
    result = result.concat(
      eventLights[2].map((light) => {
        return new Event(
          light,
          new OffPattern(1),
          new OffPattern(1),
          new OnPattern(ORANGE, 1.5, 1),
          new OffPattern(1),
          new OffPattern(1),
        );
      }),
    );
    result = result.concat(
      eventLights[3].map((light) => {
        return new Event(
          light,
          new OffPattern(1),
          new OffPattern(1),
          new OffPattern(1),
          new OnPattern(ORANGE, 1.5, 1),
          new OffPattern(1),
        );
      }),
    );
    result = result.concat(
      eventLights[4].map((light) => {
        return new Event(
          light,
          new OffPattern(1),
          new OffPattern(1),
          new OffPattern(1),
          new OffPattern(1),
          new OnPattern(ORANGE, 1.5, 1),
        );
      }),
    );
    log.info(`result: ${JSON.stringify(result)}`);
    return result;
  }
}

class LookItsWafflesScene extends AutoResetRingScene {
  constructor(lights: string[]) {

    let werewolfEye = lights.pop();

    let events: Event[] = lights.map((light) => {
      return new Event(
        light, new FlickerPattern(10, ENERGIZE, 200),
      )
    });
    events.push(new Event(
      werewolfEye,
      new SoundPattern(
        `${RESOURCES_DIR}/werewolf/david_the_beast_short.mp3`,
        new OnPattern(RED, 5),
        0,
      ),
      // 0-5 LOUD
      // 6-10 growl
      new SleepPattern(0.1),
      new OffPattern(1),
      new OnPattern(RED, 5),
      new OffPattern(1, 1),
    ));
    super(events, true);
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    log.info(
      `LookItsWafflesScene got a callback with sensor ${sensorTriggedOn}`,
    );
    await super.run(spookyHueBulbPlayer, sensorType, sensorTriggedOn);
  }
}

class CreepyCarnivalScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let lightsClone = lights.slice();
    let soundLight = lightsClone.pop();
    let spookyEvents = lightsClone.map((light) => {
      return new Event(
        light,
        new RandomColourPattern(
          55,
          RED,
          ORANGE,
          BLUE,
          GREEN,
          LAVENDER,
          SOFT_RED,
          PURPLE,
          YELLOW,
        ),
      );
    });

    spookyEvents.push(
      new Event(
        soundLight,
        new SoundPattern(
          `${RESOURCES_DIR}/clowns/clown_reverse.mp3`,
          new RandomColourPattern(
            55,
            RED,
            ORANGE,
            BLUE,
            GREEN,
            LAVENDER,
            SOFT_RED,
            PURPLE,
            YELLOW,
          ),
          0,
          1,
          true,
        ),
      ),
    );

    super(spookyEvents, true);
  }
}

class PsychoScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let lightsClone = lights.slice();
    let showerLight = lightsClone.pop();

    let spookyEvents = lightsClone.map((light) => {
      return new Event(
        light,
        new StableColourPattern(RELAX, 40, 13, 4),
        new PulsePattern(RED, 14, 0.5),
        new OnPattern(SOFT_RED, 10, 5),
      );
    });

    spookyEvents.push(
      new Event(
        showerLight,
        new SoundPattern(
          `${RESOURCES_DIR}/david_psycho.mp3`,
          new FlickerPattern(13.5, BLUE, 110),
          0,
          1,
          true,
        ),
        new PulsePattern(RED, 14, 0.5),
        new OffPattern(6, 6),
        new OnPattern(SOFT_RED, 10, 5),
      ),
    );

    super(spookyEvents, false);
  }
}

class HellBathroomCostumeScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let lightsClone = lights.slice();
    let soundLight = lightsClone.pop();

    let spookyEvents = lights.map((light) => {
      return new Event(
        light,
        new FlickerPattern(2),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      );
    });

    spookyEvents.push(
      new Event(
        soundLight,
        new SoundPattern(
          `${RESOURCES_DIR}/david_demon/david_rooftop_costume_contest.mp3`,
          new FlickerPattern(2),
          0,
          1,
          true,
        ),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      ),
    );

    super(spookyEvents, false);
  }
}

class HellBathroomFeedingScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let lightsClone = lights.slice();
    let soundLight = lightsClone.pop();

    let spookyEvents = lightsClone.map((light) => {
      return new Event(
        light,
        new FlickerPattern(2),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      );
    });

    spookyEvents.push(
      new Event(
        soundLight,
        new SoundPattern(
          `${RESOURCES_DIR}/david_demon/david_rooftop_feeding.mp3`,
          new FlickerPattern(2),
          0,
          1,
          true,
        ),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      ),
    );

    super(spookyEvents, false);
  }
}

class HellBathroomWolfScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let lightsClone = lights.slice();
    let soundLight = lightsClone.pop();

    let spookyEvents = lightsClone.map((light) => {
      return new Event(
        light,
        new SoundPattern(
          `${RESOURCES_DIR}/david_demon/david_rooftop_werewolf.mp3`,
          new FlickerPattern(2),
          0,
          1,
          true,
        ),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      );
    });

    spookyEvents.push(
      new Event(
        soundLight,
        new SoundPattern(
          `${RESOURCES_DIR}/david_demon/david_rooftop_werewolf.mp3`,
          new FlickerPattern(2),
          0,
          1,
          true,
        ),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      ),
    );

    super(spookyEvents, false);
  }
}

class DownstairsBathClownGoodbye extends AutoResetRingScene {
  constructor(lights: string[]) {
    let lightsClone = lights.slice();
    let soundLight = lightsClone.pop();

    let spookyEvents = lightsClone.map((light) => {
      return new Event(
        light,
        new FlickerPattern(3),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      );
    });

    spookyEvents.push(
      new Event(
        soundLight,
        new SoundPattern(
          `${RESOURCES_DIR}/clowns/Bathroom-Clown-Laugh.mp3`,
          new FlickerPattern(3),
          0,
          1,
          true,
        ),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      ),
    );

    super(spookyEvents, true);
  }
}

class ChromecastScene extends Scene {
  chromecaster: Chromecaster;
  started: boolean;
  deviceId: string;

  constructor(deviceId: string) {
    super();
    this.started = false;
    this.deviceId = deviceId;
  }

  async start() {
    if (!this.started) {
      log.info(`Starting chromecast ${this.deviceId}`);
      this.chromecaster = new Chromecaster(this.deviceId);
      await this.chromecaster.start();
      this.started = true;
    }
  }

  async run(
    _spook_yHueBulbPlayer: SpookyHueBulbPlayer,
    _sensorType: SensorType,
    _sensorTriggedOn: boolean,
  ): Promise<void> {
    await this.start();
  }
}

class ChromecastPortalToHell extends ChromecastScene {
  async run(
    hue: SpookyHueBulbPlayer,
    type: SensorType,
    on: boolean,
  ): Promise<void> {
    log.info(`ChromecastPortalToHell got a callback with sensor ${on}`);
    await super.run(hue, type, on);
    while (true) {
      await this.chromecaster.playVideo(PORTAL_TO_HELL);
      await sleep(PORTAL_TO_HELL.getVideoLengthSeconds() * 1000 - 5);
    }
  }
}

class ChromecastGhosts extends ChromecastScene {
  async run(
    hue: SpookyHueBulbPlayer,
    type: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    log.info(`ChromecastGhosts got a callback with sensor ${sensorTriggedOn}`);
    await super.run(hue, type, sensorTriggedOn);
    if (sensorTriggedOn) {
      let video = VIDEOS_2023[Math.floor(Math.random() * VIDEOS_2023.length)];
      await this.chromecaster.playVideo(video);
    }
  }
}

class BlackLightHallwayScene extends AutoResetRingScene {
  constructor(switch_id: string, hallway_lights: string[]) {
    // this is pulling out 15, which is the stairwell light that is not a colour light
    const white_light = hallway_lights.pop();

    let spookyEvents = hallway_lights.map((light) => {
      return new Event(
        light,
        new FlickerPattern(4),
        new OffPattern(30),
        new OnPattern(SOFT_RED, 1),
      );
    });
    spookyEvents.push(
      new Event(white_light, new FlickerPattern(4), new OffPattern(30)),
    );
    spookyEvents.push(
      new Event(
        switch_id,
        new OffPattern(4),
        new OnPattern(RELAX, 30),
        new OffPattern(1),
      ),
    );

    super(spookyEvents, true);
  }
}

class PhotoBoothScream extends AutoResetRingScene {
  constructor(lights: string[]) {
    let lightsClone = lights.slice();
    let soundLight = lightsClone.pop();

    let spookyEvents = lightsClone.map((light) => {
      return new Event(
        light,
        new FlickerPattern(10, ENERGIZE),
        new OnPattern(RELAX, 5),
      );
    });

    spookyEvents.push(
      new Event(
        soundLight,
        new RandomSoundPattern(
          [
            `${RESOURCES_DIR}/startle/woman-scream-pain-short.mp3`,
            `${RESOURCES_DIR}/global/float_too.mp3`,
            `${RESOURCES_DIR}/startle/david-startle-strings.mp3`,
            `${RESOURCES_DIR}/startle/david-startle-alien-extra-short.mp3`,
            `${RESOURCES_DIR}/startle/david-startle-lightning.mp3`,
            `${RESOURCES_DIR}/startle/david-startle-strings.mp3`,
            `${RESOURCES_DIR}/startle/david-startle-alien-extra-short.mp3`,
            `${RESOURCES_DIR}/startle/david-startle-lightning.mp3`,
            //`${RESOURCES_DIR}/startle/boo-1.mp3`,
            //`${RESOURCES_DIR}/startle/boo-2.mp3`,
            `${RESOURCES_DIR}/startle/boo-3.mp3`,
            `${RESOURCES_DIR}/startle/boo-4.mp3`,
          ],
          new FlickerPattern(10, ENERGIZE),
          0,
          1,
        ),
        new OnPattern(RELAX, 5),
      ),
    );

    super(spookyEvents, true);
  }
}

class AtticAttackScene extends AutoResetRingScene {
  constructor(lights: string[]) {

    let events: Event[] = lights.map((light) => {
      return new Event(
        light, 
        new SoundPattern(
          `${RESOURCES_DIR}/attic/attic_attack.mp3`,
          new FlickerPattern(8, ENERGIZE, 200),
          0,
        ),
        new OnPattern(RED, 8, 0.5),
      )
    });

    super(events, true);
  }
}

class AtticLurkScene extends AutoResetRingScene {
  constructor(lights: string[]) {

    let events: Event[] = lights.map((light) => {
      return new Event(
        light, 
        new SoundPattern(
          `${RESOURCES_DIR}/attic/attic_lurk.mp3`,
          new PulsePattern(RED, 24, 0.5),
          0,
        )

      )
    });

    super(events, true);
  }
}

class AtticRuckusScene extends AutoResetRingScene {
  constructor(lights: string[]) {

    let events: Event[] = lights.map((light) => {
      return new Event(
        light, 
        new SoundPattern(
          `${RESOURCES_DIR}/attic/attic_ruckus.mp3`,
          new FlickerPattern(23, ENERGIZE, 200),
          0,
        )

      )
    });

    super(events, true);
  }
}

class CumScene extends AutoResetRingScene {
  constructor(switch_id: string, lights: string[]) {

    let spookyEvents = lights.map((light) => {
      return new Event(
        light,
        new RandomSoundPattern(
          [
            `${RESOURCES_DIR}/ghost_cum/ghost_cum_1.mp3`,
            `${RESOURCES_DIR}/ghost_cum/ghost_cum_2.mp3`,
            `${RESOURCES_DIR}/ghost_cum/ghost_cum_3.mp3`,
            `${RESOURCES_DIR}/ghost_cum/ghost_cum_4.mp3`,
          ],
          new FlickerPattern(4),
        ),
        new OffPattern(30),
        new OnPattern(RELAX, 1),
      );
    });
    spookyEvents.push(
      new Event(
        switch_id,
        new OffPattern(4),
        new OnPattern(RELAX, 30),
        new OffPattern(1),
      ),
    );

    super(spookyEvents, true);
  }
}

function get_downstairs_bathroom_scene(lights: string[]): RandomMultiScene {
  const spookyScenes = [
    new HellBathroomCostumeScene(Object.assign([], lights)),
    new HellBathroomFeedingScene(Object.assign([], lights)),
    new HellBathroomWolfScene(Object.assign([], lights)),
    new DownstairsBathCreepyClownShowerScene(Object.assign([], lights)),
    new ElectricLady(Object.assign([], lights)),
    new PsychoScene(Object.assign([], lights)),
    new DownstairsBathCreepyClownShowerScene(Object.assign([], lights)),
    new ElectricLady(Object.assign([], lights)),
    new PsychoScene(Object.assign([], lights)),
    new DownstairsBathCreepyClownShowerScene(Object.assign([], lights)),
    new ElectricLady(Object.assign([], lights)),
    new PsychoScene(Object.assign([], lights)),
  ];

  return new RandomMultiScene(spookyScenes, []);
}

export function getScenes(device_name: string): { [key: string]: Scene } {
  let main_scenes = {
    /* Front light flicker
     * Room: Front patio
     * Trigger: motion sensor
     * Effect: single light flicker
     * Sound: None
     * Infra setup: None
     * Computer: TBD (any)
     */
    front_light_flicker: new FrontLightFlickerScene(getLights(front_patio)),

    /* Clown room (CUT!)
     * Room: Matt's Office
     * Trigger: motion sensor
     * Effect: colorful rainbow lights
     * Sound: Weird clown stuff. David sound
     * Infra setup: Colored tri-lamp, PC or pi?, Speaker
     * Computer: TBD
     */
    creepy_carnival: new CreepyCarnivalScene(getLights(clown_room)),
    down_bath_leaving: new DownstairsBathClownGoodbye(getLights(clown_room)),

    /* The Devil's Hallway
     * Room: Upstairs hallway, Dressing room
     * Trigger: always on
     * Effect: first light solid red, pulsing red light near the devil and in Dressing room
     * Sound: None
     * Infra setup: None
     * Computer: TBD
     */
    // TODO red pulses
    halloween_hallway: new HalloweenHallway(getLights(halloween_hallway)),

    /* Kitchen Creeps
     * Room: Kitchen
     * Trigger: Back door contact sensor
     * Effect: Outdoor lightning, creepy indoor lights n stuff
     * Sound: Lightning, creepy witches n stuff
     * Infra setup: Laptop, speaker
     * Computer: TBD
     */
    // TODO

    /* Primary Bathroom Creeps
     * Room: Primary Bathroom
     * Trigger: motion sensor
     * Effect: random old scene
     * Sound: random old scene
     * Infra setup: Disable big light, pi, speaker
     * Computer: TBD
     */
    classic_haunts: get_downstairs_bathroom_scene(getLights(downstairs_bathroom)),

    /* Garage Haunt
     * Room: Garage
     * Trigger: random every ~20 minutes
     * Effect: attic lights turn colors, garage lights flash
     * Sound: Sounds of walking upstairs, ghosts and ghouls
     * Infra setup: Pi, Speaker
     * Computer: TBD
     */
    attic_lurk: new AtticLurkScene(getLights(garage)),
    attic_ruckus: new AtticRuckusScene(getLights(garage)),
    attic_attack: new AtticAttackScene(getLights(garage)),

    /* Calming Cockroaches
     * Room: Upstairs bathroom
     * Trigger: motion sensor + downstairs bath contact sensor closed
     * Effect: calming cockroaches
     * Sound: calming cockroaches
     * Infra setup: pi, speaker
     * Computer: TBD
     */
    calming_cockroaches: new CalmingCockroachesScene(getLights(upstairs_bathroom)),

    /* The Werewolf
     * Room: Utility closet
     * Trigger: downstairs bath contact sensor opened
     * Effect: flashing lights, werewolf eyes red
     * Sound: Werewolf growls
     * Infra setup: Pi, Speaker
     * Computer: TBD
     */
    look_its_waffles: new LookItsWafflesScene(getLights(werewolf_scene)),

    /* Ghost cum
     * Room: Exercise room
     * Trigger: motion sensor
     * Effect: lights out, revealing ghost cum
     * Sound: TBD
     * Infra setup: Laptop, speaker, lamps w/ white lights, hanging black lights
     * Computer: TBD
     */
    black_light_hallway: new CumScene(
      getLights(power_switch)[0],
      getLights(workout_room),
    ),

    /* Photobooth spooks
     * Room: Anna's library
     * Trigger: photobooth 3rd photo
     * Effect: startling sounds
     * Sound: flashing lights
     * Infra setup: Matt's Laptop, speaker w/ bluetooth, lamps
     * Computer: TBD
     */
    photobooth_spooks: new PhotoBoothScream(getLights(photobooth_spooks)),

    /* Chromecast ghosts
     * Room: Living room
     * Trigger: random every ~10 minutes, front motion sensor
     * Effect: startling sounds
     * Sound: flashing lights
     * Infra setup: Matt's Laptop, speaker w/ bluetooth, lamps
     * Computer: TBD
     */
    chromecast_ghosts: new ChromecastGhosts("Chromecast-70c4c8babee87879b01e6d819b6b5e97"),

    // ========== END 2025 Scenes ================

    // Test individual scenes
    creepy_clown_shower: new DownstairsBathCreepyClownShowerScene(getLights(downstairs_bathroom)),
    psycho: new PsychoScene(getLights(downstairs_bathroom)),
    electric_lady: new ElectricLady(getLights(downstairs_bathroom)),

    // Test and Utility scenes
    list: new ListOnLightsScene(),
    set_light_color: new SetLightColor("26", PURPLE),
    flash_lights: new LoopThroughAllLights(),
    cycle_colors: new CycleColors(["26", "6"]),
    get_light: new GetLight(26), // Change this to get the state of different lights by ID
    find_bulb: new FindBulb(getLights(downstairs_bathroom)),
  };

  return main_scenes;
}
