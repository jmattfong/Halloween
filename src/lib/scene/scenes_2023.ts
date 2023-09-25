import { getLogger } from '../logging';
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from '../ring';
import { SpookyHueApi } from '../hue/hue';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { OnPattern, Pattern } from './patterns';
import { Event } from "./events";
import { Scene, MultiPartScene } from './scenes';
import { RED, RELAX } from '../config';
import { SensorType } from "../web_listener/webserver";

const log: CategoryLogger = getLogger("scenes_2023");

/**
 * List all lights that are on
 */
class ListOnLightsScene extends Scene {
    async run(spookyHueBulbPlayer: SpookyHueBulbPlayer, sensorType: SensorType, sensorTriggedOn: boolean): Promise<void> {

        const allLights = await spookyHueBulbPlayer.api.getLights();

        let lights: Object[] = [];

        for (let i = 0; i < allLights.length; i++) {
            let light = allLights[i];
            let on = light["_data"]["state"]["on"];
            let reachable = light["_data"]["state"]["reachable"];
            if (on && reachable) {
                log.info(`Light is on: ${JSON.stringify(light)}`);

                let light_config = {
                    "id": light["_data"]["id"],
                    "type": light["_data"]["type"],
                    "name": light["_data"]["name"],
                    "productname": light["_data"]["productname"]
                };
                lights.push(light_config);
            }
        }

        log.info(`Light config for ON and REACHABLE lights:\n ${JSON.stringify(lights)}`);
    }
}

class GetLight extends Scene {
    lightIdToGet: number;
    constructor(lightIdToGet: number) {
        super();
        this.lightIdToGet = lightIdToGet;
    }

    async run(spookyHueBulbPlayer: SpookyHueBulbPlayer, sensorType: SensorType, sensorTriggedOn: boolean): Promise<void> {
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

class FindBulb extends MultiPartScene {
    constructor(ringSensorName: string, lights: string[]) {
        let defaultLighting: Pattern = new OnPattern(RELAX, 3);
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting,
                new OnPattern(RED, 10),
                defaultLighting);
        });
        let unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting);
        });
        super(ringSensorName, events, unSpookyEvents);
    }
}

export const SCENES_2023: { [key: string]: Scene; } = {
    // Test and Utility scenes
    "list": new ListOnLightsScene(),
    "get_light": new GetLight(21), // Change this to get the state of different lights by ID
    // "test_ring": new TestRingScene(),
    "find_bulb": new FindBulb("Waffles' Room", ["down_bath_1", "down_bath_2", "down_bath_3"]),
    // Scenes for the party

};