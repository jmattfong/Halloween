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
  RED,
  LAVENDER,
  SOFT_RED,
  RELAX,
  BLUE,
  ORANGE,
  PURPLE,
  YELLOW,
} from "../config";
import { SensorType } from "../web_listener/webserver";

const log: CategoryLogger = getLogger("scenes_2024");

const RESOURCES_DIR: String = "resources/2024_sounds";

const DEFAULT_LIGHTING: Pattern = new OnPattern(RELAX, 3);

function getUnspookyEvents(lights: string[]) {
  return lights.map((light) => {
    return new Event(light, DEFAULT_LIGHTING);
  });
}

/**
 * List all lights that are on
 */
class ListOnLightsScene extends Scene {
  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    const allLights = await spookyHueBulbPlayer.api.getLights();

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
      `Light config for ON and REACHABLE lights:\n ${JSON.stringify(lights)}`,
    );
  }
}

class GetLight extends Scene {
  lightIdToGet: number;
  constructor(lightIdToGet: number) {
    super();
    this.lightIdToGet = lightIdToGet;
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    const allLights = await spookyHueBulbPlayer.api.getLights();

    for (let i = 0; i < allLights.length; i++) {
      let light = allLights[i];
      let id = light["_data"]["id"];
      if (id == this.lightIdToGet) {
        log.info(`Light: ${JSON.stringify(light)}`);
        return;
      }
    }
    log.info(`Could not find light with id ${this.lightIdToGet}`);
  }
}

class LoopThroughAllLights extends Scene {
  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    const allLights = await spookyHueBulbPlayer.api.getLights();

    for (let i = 0; i < allLights.length; i++) {
      let light = allLights[i];
      let id = light["_data"]["id"];

      log.info(`Flashing light #${id}`);
      const flashEvent = new Event(
        id,
        new OffPattern(1),
        new OnPattern(RED, 1),
        new OffPattern(1),
        new OnPattern(RED, 1),
      );

      await spookyHueBulbPlayer.playPattern(flashEvent);
    }
  }
}

class SetLightColor extends MultiPartScene {
  constructor(light: string, color: Color) {
    let lights = [light];
    let events: Event[] = lights.map((light) => {
      return new Event(light, new OnPattern(color, 15), DEFAULT_LIGHTING);
    });
    super(events, getUnspookyEvents(lights));
  }
}

class FindBulb extends MultiPartScene {
  constructor(lights: string[]) {
    let events: Event[] = lights.map((light) => {
      return new Event(
        light,
        new OnPattern(RED, 10),
        DEFAULT_LIGHTING,
        new OffPattern(4),
        new OnPattern(RED, 10),
        DEFAULT_LIGHTING,
        new OffPattern(4),
        new OnPattern(RED, 10),
        DEFAULT_LIGHTING,
        new OffPattern(4),
        new OnPattern(RED, 10),
        DEFAULT_LIGHTING,
        new OffPattern(4),
        new OnPattern(RED, 10),
        DEFAULT_LIGHTING,
        new OffPattern(4),
        new OnPattern(RED, 10),
        DEFAULT_LIGHTING,
        new OffPattern(4),
      );
    });
    super(events, getUnspookyEvents(lights));
  }
}

class CycleColors extends MultiPartScene {
  constructor(lights: string[]) {
    let events: Event[] = lights.map((light) => {
      return new Event(
        light,
        new OnPattern(RED, 2),
        new OnPattern(ORANGE, 2),
        new OnPattern(YELLOW, 2),
        new OnPattern(GREEN, 2),
        new OnPattern(BLUE, 2),
        new OnPattern(PURPLE, 2),
        new OnPattern(LAVENDER, 2),
        new OnPattern(SOFT_RED, 2),
      );
    });
    super(events, getUnspookyEvents(lights));
  }
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

/**
 * TODO make these creepy clown laughs
 */
class ClownLaughScene extends MultiPartScene {
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
    super(events, getUnspookyEvents(lights), true);
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
    let showerLight = lights.pop();

    let spookyEvents: Event[] = lights.map((light) => {
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
        ),
        new OffPattern(1),
      ),
    );

    super(spookyEvents, true);
  }
}

class WerewolfDoorJiggleScene extends Scene {
  spookyEvent: Event;
  constructor() {
    super();
    this.spookyEvent = new Event(
      "",
      new SoundPattern(
        `${RESOURCES_DIR}/david_scratching_dog.mp3`,
        new SleepPattern(0),
        0,
      ),
    );
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    _sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    log.info(
      `WerewolfDoorJiggleScene got callback with sensor ${sensorTriggedOn}`,
    );
    if (sensorTriggedOn) {
      spookyHueBulbPlayer.playPattern(this.spookyEvent);
    }
  }
}

class LookItsWafflesScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let events: Event[] = lights.map((light) => {
      // 0-4 - growl
      // 5-10 growl
      // 12-14 LOUD
      // 15-17 LOUD
      // 17-19 growl
      // 21-24 growl
      // 25-28 growl
      // 29-31 LOUD
      // -32 LOUD
      return new Event(
        light,
        new SoundPattern(
          `${RESOURCES_DIR}/david_the_beast.mp3`,
          new OnPattern(SOFT_RED, 4),
          0,
        ),
        new SleepPattern(0.1),
        new OffPattern(1),
        new OnPattern(SOFT_RED, 5),
        new OffPattern(2),
        new OnPattern(RED, 5),
        new OnPattern(SOFT_RED, 2),
        new OffPattern(1),
        new OnPattern(SOFT_RED, 8),
        new OffPattern(1),
        new OnPattern(RED, 9),
        new OffPattern(1, 1),
      );
    });
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

// Song is 161 seconds long
class CalmingCockroachesScene extends MultiPartScene {
  constructor(lights: string[]) {
    let spookyEvents = [
      new Event(
        lights[0],
        new SoundPattern(
          `${RESOURCES_DIR}/calming_cockroaches/enya_bugs.mp3`,
          new OnPattern(LAVENDER, 150, 11),
          0,
          1,
          true,
        ),
        new OffPattern(6, 6),
      ),
      new Event(
        lights[1],
        new OnPattern(RELAX, 13, 4),
        new OnPattern(RELAX, 10, 5),
      ),
    ];

    const unspookyEvents = lights.map((light) => {
      return new Event(light, new OnPattern(LAVENDER, 150, 11));
    });

    super(spookyEvents, unspookyEvents, false);
  }
}

class CreepyCarnivalScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let spookyEvents = lights.map((light) => {
      return new Event(
        light,
        new RandomColourPattern(
          20,
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

    super(spookyEvents, true);
  }
}

class PsychoScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let showerLight = lights.pop();

    let spookyEvents = lights.map((light) => {
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
        ),
        new PulsePattern(RED, 14, 0.5),
        new OffPattern(6, 6),
        new OnPattern(SOFT_RED, 10, 5),
      ),
    );

    super(spookyEvents, false);
  }
}

// Song is 66 seconds long, first 10 sec are silent
class ScreamScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let spookyEvents = lights.map((light) => {
      return new Event(
        light,
        new SoundPattern(
          `${RESOURCES_DIR}/scream/scream_bathroom.mp3`,
          new OnPattern(RED, 45, 10),
          0,
        ),
        new OnPattern(RELAX, 20, 0.5),
        new OffPattern(4, 0.2),
        new OnPattern(SOFT_RED, 1, 1),
      );
    });

    super(spookyEvents, false);
  }
}

class HellBathroomCostumeScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let spookyEvents = lights.map((light) => {
      return new Event(
        light,
        new SoundPattern(
          `${RESOURCES_DIR}/david_demon/david_rooftop_costume_contest.mp3`,
          new FlickerPattern(2),
          0,
        ),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      );
    });

    super(spookyEvents, false);
  }
}

class HellBathroomFeedingScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let spookyEvents = lights.map((light) => {
      return new Event(
        light,
        new SoundPattern(
          `${RESOURCES_DIR}/david_demon/david_rooftop_feeding.mp3`,
          new FlickerPattern(2),
          0,
        ),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      );
    });

    super(spookyEvents, false);
  }
}

class HellBathroomWolfScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let spookyEvents = lights.map((light) => {
      return new Event(
        light,
        new SoundPattern(
          `${RESOURCES_DIR}/david_demon/david_rooftop_werewolf.mp3`,
          new FlickerPattern(2),
          0,
        ),
        new OnPattern(RED, 35, 0.5),
        new OnPattern(SOFT_RED, 1, 1),
      );
    });

    super(spookyEvents, false);
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

/**
 * TODO
 */
function get_photobooth_scene(): RandomMultiScene {
  const spookyScenes = [
    // new WerewolfDoorJiggleScene(),
    new ThunderScene(getLights("guest_bedroom")),
  ];
  return new RandomMultiScene(spookyScenes, []);
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

  const stillSpookyClownLaughEvents = lights.map((light) => {
    return new Event(
      light,
      new RandomSoundPattern(
        [
          `${RESOURCES_DIR}/thunder/thunder_sound_1.mp3`,
          `${RESOURCES_DIR}/thunder/thunder_sound_2.mp3`,
        ],
        new FlickerPattern(3),
      ),
      new StableColourPattern(RELAX, 30, 13, 4),
    );
  });

  return new RandomMultiScene(spookyScenes, stillSpookyClownLaughEvents);
}

function get_bedroom_murder_scene(lights: string[]): RandomMultiScene {
  const spookyScenes = [new PsychoScene(Object.assign([], lights))];

  return new RandomMultiScene(spookyScenes, []);
}

const LIGHTS = {
  front_walkway: ["29", "30"],
  downstairs_entry: ["17", "24"],
  downstairs_bathroom: ["7", "8", "9"],
  downstairs_office: ["3", "6", "26"],
  half_bathroom: ["1", "2"],
  guest_bathroom: ["20", "32", "22"],
  guest_bedroom: ["23", "31"],
  upstairs_hall: ["15", "4", "5", "27"],
  switch: ["33"],
} as const;

function getLights(roomName: string): string[] {
  return Object.assign([], LIGHTS[roomName]);
}

export function getScenes(device_name: string): { [key: string]: Scene } {
  let main_scenes = {
    // Scenes for the party
    // Main server's scenes
    photobooth_spooks: get_photobooth_scene(),
    chromecast_portal_to_hell: new ChromecastPortalToHell(
      "Chromecast-HD-36a10199048bd09c03c63e7f05c555c2",
    ),
    chromecast_ghosts: new ChromecastGhosts(
      "Chromecast-70c4c8babee87879b01e6d819b6b5e97",
    ),
    front_light_flicker: new FrontLightFlickerScene(
      getLights("front_walkway").concat(getLights("downstairs_entry")),
    ),

    // Scenes for The Beast
    creepy_carnival: new CreepyCarnivalScene(getLights("downstairs_office")),

    // Hank's scenes
    down_bath_random: get_downstairs_bathroom_scene(
      getLights("downstairs_bathroom"),
    ),

    // Bill's scenes
    master_bedroom: get_bedroom_murder_scene(getLights("upstairs_hall")), // TODO

    // Dale's scene
    calming_cockroaches: new CalmingCockroachesScene(
      getLights("half_bathroom"),
    ),

    // Boomhaur's scenes
    scream: new ScreamScene(getLights("guest_bathroom")), // TODO
    black_light_hallway: new BlackLightHallwayScene(
      getLights("switch")[0],
      getLights("upstairs_hall"),
    ),

    // Test individual scenes
    creepy_clown_shower: new DownstairsBathCreepyClownShowerScene(
      getLights("half_bathroom"),
    ),
    psycho: new PsychoScene(getLights("half_bathroom")),
    electric_lady: new ElectricLady(getLights("half_bathroom")),
    werewolf_door_jiggle: new WerewolfDoorJiggleScene(),
    look_its_waffles: new LookItsWafflesScene(getLights("half_bathroom")),

    // Test and Utility scenes
    list: new ListOnLightsScene(),
    set_light_color: new SetLightColor("26", PURPLE),
    flash_lights: new LoopThroughAllLights(),
    cycle_colors: new CycleColors(["26", "6"]),
    get_light: new GetLight(26), // Change this to get the state of different lights by ID
    find_bulb: new FindBulb(getLights("downstairs_office")),
    find_bulb_2: new FindBulb(getLights("downstairs_bathroom")),
    find_bulb_3: new FindBulb(getLights("downstairs_office")),
  };

  main_scenes["dev_scene"] = main_scenes["down_bath_random"];

  return main_scenes;
}
