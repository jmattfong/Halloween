import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
import { SpookyHueBulbPlayer } from "../hue/spooky_bulb_player";
import {
  OffPattern,
  OnPattern,
  Pattern,
} from "./patterns";
import { Event } from "./events";
import {
  Scene,
  MultiPartScene,
} from "./scenes";
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
    getLights
} from "./locations_brandon";

const log: CategoryLogger = getLogger("scenes_2024");

const DEFAULT_LIGHTING: Pattern = new OnPattern(RELAX, 3);

function getUnspookyEvents(lights: string[]) {
  return lights.map((light) => {
    return new Event(light, DEFAULT_LIGHTING);
  });
}

/**
 * List all lights that are on
 */
export class ListOnLightsScene extends Scene {
  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    _sensorType: SensorType,
    _sensorTriggedOn: boolean,
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

export class GetLight extends Scene {
  lightIdToGet: number;
  constructor(lightIdToGet: number) {
    super();
    this.lightIdToGet = lightIdToGet;
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    _sensorType: SensorType,
    _sensorTriggedOn: boolean,
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

export class LoopThroughAllLights extends Scene {
  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    _sensorType: SensorType,
    _sensorTriggedOn: boolean,
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

export class SetLightColor extends MultiPartScene {
  constructor(light: string, color: Color) {
    let lights = [light];
    let events: Event[] = lights.map((light) => {
      return new Event(light, new OnPattern(color, 15), DEFAULT_LIGHTING);
    });
    super(events, getUnspookyEvents(lights));
  }
}

export class FindBulb extends MultiPartScene {
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

export class CycleColors extends MultiPartScene {
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

export function getUtilScenes(device_name: string): { [key: string]: Scene } {
  return {
    // Test and Utility scenes
    list: new ListOnLightsScene(),
    set_light_color: new SetLightColor("26", PURPLE),
    flash_lights: new LoopThroughAllLights(),
    cycle_colors: new CycleColors(["26", "6"]),
    get_light: new GetLight(26), // Change this to get the state of different lights by ID
    find_bulb: new FindBulb([device_name]),
  };
}
