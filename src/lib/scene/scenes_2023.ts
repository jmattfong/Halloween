import { HueSensorUpdate, HueSensor } from '../hue/sensor';
import { Chromecaster } from '../chromecast';
import { getLogger } from '../logging';
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from '../ring';
import { SpookyHueApi } from '../hue/hue';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, RandomSoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './patterns';
import { Event } from "./events";
import { Scene, SplitPartScene, MultiPartScene, AutoResetRingScene, RepeatingScene } from './scenes';
import { INTRO_VIDEO_2022 } from '../videos';
import { CONFIG, RED, SOFT_RED, RELAX, CONCENTRATE, ENERGIZE, DIMMED, NIGHTLIGHT, ORANGE, BLUE } from '../config';
import { EventMessage, WebServer } from "../web_listener/webserver";
import { RingDeviceData } from "ring-client-api";

const log: CategoryLogger = getLogger("scenes_2023");

/**
 * List all lights that are on
 */
class ListOnLightsScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const hue: SpookyHueApi = await hueFunction();
        const allLights = await hue.getLights();

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

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const hue: SpookyHueApi = await hueFunction();
        const allLights = await hue.getLights();

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

class TestRingScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const ring: RingEnhancedSpookinatorV2 = await _ringFunction();
        ring.getSensors();
    }
}

class WebServerScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>,  webServer: WebServer): Promise<void> {
        
    }
}

class RingCallbackScene extends WebServerScene {
    
}

export class MainListeningServer {

    private callbacks: Map<string, number> = new Map();

    async start(
        ringFunction: () => Promise<RingEnhancedSpookinatorV2>,
        hueFunction: () => Promise<SpookyHueApi>,
        webServer: WebServer
      ): Promise<void> {
        var ring = await ringFunction();
        const ringSensors = await ring.getSensors();
        ringSensors.forEach((ringSensor) => {
            var ringCallback = (data: RingDeviceData) => {
                let ring_id = `ring_${data.name}`;
                log.info(`callback called on ${ring_id}`);
                // call proper webserver
                let callbackPort = this.callbacks.get(ring_id);
                if (callbackPort) {
                    fetch(`http://localhost:${callbackPort}/event`, {
                        method: 'POST',
                        body: JSON.stringify({
                            name: ring_id,
                            data: data.faulted ? 1 : 0,
                        }),
                        headers: {'Content-Type': 'application/json; charset=UTF-8'} }
                    );
                }
            };
            ring.addSensorCallback(ringSensor, ringCallback);
        });

        var spookhue = await hueFunction();
        const hueSensors = await spookhue.getSensors();
        hueSensors.forEach((hueSensor) => {
            let hueSensorId = hueSensor.getId();
            var hueCallback = (data: HueSensorUpdate) => {
                let hue_id = `ring_${hueSensor.getId()}`;
                log.info(`callback called on ${hueSensorId} => ${data.getPresence()}`);
                // TODO call proper webserver
                let callbackPort = this.callbacks.get(hue_id);
                if (callbackPort) {
                    fetch(`http://localhost:${callbackPort}/event`, {
                        method: 'POST',
                        body: JSON.stringify({
                            name: hue_id,
                            data: data.getPresence() ? 1 : 0,
                        }),
                        headers: {'Content-Type': 'application/json; charset=UTF-8'} }
                    );
                }
            };

            hueSensor.addCallback(hueCallback);
            hueSensor.start();
        })

        webServer.addCallback("register",  (event: EventMessage) => {
            let sensor_id: string = event.name;
            let port: number = event.data;

            this.callbacks.set(sensor_id, port);
        });    
      }
}

export const SCENES_2023: { [key: string]: Scene; } = {
    // Test and Utility scenes
    "list": new ListOnLightsScene(),
    "get_light": new GetLight(21), // Change this to get the state of different lights by ID
    "test_ring": new TestRingScene(),
    "find_bulb": new FindBulb("Waffles' Room", ["down_bath_1", "down_bath_2", "down_bath_3"]),
    // Scenes for the party

};