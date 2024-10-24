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

class GuestVibeScene extends AutoResetRingScene {
  constructor(lights: string[]) {
    let spookyEvents = lights.map((light) => {
      return new Event(
        light,
        new StableColourPattern(RED, 40, 5, 5),
        new StableColourPattern(SOFT_RED, 15, 5, 5),
        new StableColourPattern(RED, 40, 5, 5),
        new StableColourPattern(SOFT_RED, 15, 5, 5),
        new StableColourPattern(RED, 40, 5, 5),
        new StableColourPattern(SOFT_RED, 15, 5, 5),
        new StableColourPattern(RED, 40, 5, 5),
        new OnPattern(SOFT_RED, 10, 5),
      );
    });

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
            `${RESOURCES_DIR}/startle/boo-1.mp3`,
            `${RESOURCES_DIR}/startle/boo-2.mp3`,
            `${RESOURCES_DIR}/startle/boo-3.mp3`,
            `${RESOURCES_DIR}/startle/boo-4.mp3`,
            `${RESOURCES_DIR}/startle/bazinga.mp3`,
            `${RESOURCES_DIR}/startle/boo-1.mp3`,
            `${RESOURCES_DIR}/startle/boo-2.mp3`,
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

const LIGHTS = {
  front_walkway: ["29", "30"],
  downstairs_entry: ["17", "24"],
  downstairs_bathroom: ["7", "8", "9"],
  downstairs_office: ["3", "16", "19", "26"],
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
    photobooth_spooks: new PhotoBoothScream(getLights("guest_bedroom")),
    chromecast_portal_to_hell: new ChromecastPortalToHell(
      "Chromecast-HD-36a10199048bd09c03c63e7f05c555c2",
    ),
    chromecast_ghosts: new ChromecastGhosts(
      "Chromecast-70c4c8babee87879b01e6d819b6b5e97",
    ),
    front_light_flicker: new FrontLightFlickerScene(getLights("front_walkway")),

    // Hank's scenes (Downstairs bathroom)
    down_bath_random: get_downstairs_bathroom_scene(
      getLights("downstairs_bathroom"),
    ),
    down_bath_leaving: new DownstairsBathClownGoodbye(
      getLights("downstairs_bathroom"),
    ),

    // Bill's scenes (Downstairs office)
    creepy_carnival: new CreepyCarnivalScene(getLights("downstairs_office")),

    // Dale's scene (Living room bathroom)
    calming_cockroaches: new CalmingCockroachesScene(
      getLights("half_bathroom"),
    ),

    // Boomhauer's scenes (Upstairs bathroom)
    guest_bath: new GuestVibeScene(getLights("guest_bathroom")),
    black_light_hallway: new BlackLightHallwayScene(
      getLights("switch")[0],
      getLights("upstairs_hall"),
    ),

    // Test individual scenes
    creepy_clown_shower: new DownstairsBathCreepyClownShowerScene(
      getLights("downstairs_bathroom"),
    ),
    psycho: new PsychoScene(getLights("downstairs_bathroom")),
    electric_lady: new ElectricLady(getLights("downstairs_bathroom")),

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
