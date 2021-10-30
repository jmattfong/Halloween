import { RingDeviceData } from 'ring-client-api'
import { HueSensorUpdate, HueSensor } from '../hue/sensor';
import { Chromecaster } from '../chromecast';
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from '../ring';
import { SpookyHueApi } from '../hue/hue';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './patterns';
import { red, white, blueish_white } from '../hue/colour';
import { Event, getElectricLadyEvent, getChillEvents, getPulsingRedEvent, getSpookyCockroachScene, getSpookyGhostScene, getAlienEvents } from "./events"

const log: CategoryLogger = getLogger("scene")

/**
 * A scene is something that uses a ring or hue callback to change some lights, display something, or play audio
 */
export abstract class Scene {
    ringCallback: [string, (data: RingDeviceData) => void] | null
    hueCallback: [number, (update: HueSensorUpdate) => void] | null

    constructor() {
        this.ringCallback = null
        this.hueCallback = null
    }

    abstract setup(ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void>;

    async start(ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        await this.setup(ringFunction, hueFunction)

        if (this.ringCallback != null) {
            var [ringId, ringCallback] = this.ringCallback;
            var ring = await ringFunction()
            const sensors = await ring.getSensors();
            sensors.forEach(s => {
                if (ringId == s.name) {
                    ring.addSensorCallback(s, ringCallback);
                }
            })
        }
        if (this.hueCallback != null) {
            var [hueId, hueCallback] = this.hueCallback;
            var spookhue = await hueFunction()

            const hueWalkwaySensor = await spookhue.getSensor(hueId);
            log.info(`found hue sensor: ${hueWalkwaySensor.toString()}`)

            hueWalkwaySensor.addCallback(hueCallback);
            hueWalkwaySensor.start();
        }
    }
}

class MultiPartScene extends Scene {

    ringSensorName: string
    hueSensorId?: number
    spookyEvents: Event[]
    unSpookyEvents: Event[]

    constructor(ringSensorName: string, spookyEvents: Event[], unSpookyEvents: Event[], hueSensorId?: number) {
        super()
        this.ringSensorName = ringSensorName
        this.spookyEvents = spookyEvents
        this.unSpookyEvents = unSpookyEvents
        this.hueSensorId = hueSensorId;
    }

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());

        this.ringCallback = [this.ringSensorName, (data: RingDeviceData) => {
            log.info(`callback called on ${data.name}`);

            // if the data.faulted is true, that means that the door is open and we should resort to the
            // unspooky base pattern
            // otherwise, pick a random pattern and play it!
            if (data.faulted) {
                this.unSpookyEvents.forEach(event => {
                    spookyHueBulbPlayer.playPattern(event)
                });
            } else {
                this.spookyEvents.forEach(event => {
                    spookyHueBulbPlayer.playPattern(event)
                });
            }
        }];

        if (this.hueSensorId != null) {
            this.hueCallback = [this.hueSensorId, (data: HueSensorUpdate) => {
                log.info(`callback called on ${this.hueSensorId} => ${data.getPresence()}`)

                if (data.getPresence()) {
                    this.spookyEvents.forEach(event => {
                        spookyHueBulbPlayer.playPattern(event);
                    })
                } else {
                    this.unSpookyEvents.forEach(event => {
                        spookyHueBulbPlayer.playPattern(event);
                    })
                }
            }]
        }
    }
}

class RandomMultiScene extends Scene {

    ringSensorName: string
    spookyEventChoices: Event[][]
    unSpookyEvents: Event[]

    constructor(ringSensorName: string, spookyEventChoices: Event[][], unSpookyEvents: Event[]) {
        super()
        this.ringSensorName = ringSensorName
        this.spookyEventChoices = spookyEventChoices
        this.unSpookyEvents = unSpookyEvents
    }

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());

        this.ringCallback = [this.ringSensorName, (data: RingDeviceData) => {
            log.info(`callback called on ${data.name}`);

            // if the data.faulted is true, that means that the door is open and we should resort to the
            // unspooky base pattern
            // otherwise, pick a random pattern and play it!
            let patternWorkflow: Event[];
            if (data.faulted) {
                patternWorkflow = this.unSpookyEvents;
            } else {
                const patternIndex = Math.floor(Math.random() * this.spookyEventChoices.length);
                log.debug(`choosing pattern #${patternIndex}`)
                patternWorkflow = this.spookyEventChoices[patternIndex];
            }

            patternWorkflow.forEach(event => {
                spookyHueBulbPlayer.playPattern(event)
            });
        }];
    }
}

class RandomSpookyScene extends RandomMultiScene {
    constructor(ringSensor: string, subLightName: string, ...mainLightNames: string[]) {
        super(ringSensor,
            [
                getElectricLadyEvent(subLightName, ...mainLightNames),
                getPulsingRedEvent(subLightName, ...mainLightNames),
                getSpookyCockroachScene(...mainLightNames),
                getSpookyGhostScene(...mainLightNames),
                // TODO getAlienEvents(...mainLightNames),
            ],
            getChillEvents(subLightName, ...mainLightNames))
    }
}

class HalfBathroomScene extends RandomSpookyScene {

    constructor() {
        super("Half Bathroom", "half_bath_3", "half_bath_2", "half_bath_1")
    }
}

class DownstairsBathroomScene extends RandomSpookyScene {

    constructor() {
        super("Waffles' Room", "down_bath_3", "down_bath_2", "down_bath_1")
    }
}

class LivingRoomScene extends RandomSpookyScene {

    constructor() {
        super("Living Room", "living_room_4", "living_room_3", "living_room_2", "living_room_1")
    }
}

class ChromecastScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const chromecaster = new Chromecaster()
        await chromecaster.start();
        this.hueCallback = [
            2,
            (update: HueSensorUpdate) => {
                log.info(`received status update: ${update}`);
                if (update.getPresence()) {
                    chromecaster.playRandomVideo();
                }
            }
        ]
    }
}

/**
 * Spooky ass hallway scene
 */
class HallwayScene extends MultiPartScene {
    constructor() {
        const spookyHallwayTop = new Event(
            "upstairs_2", new SoundPattern("resources/electric_sparks_1.mp3", new FlickerPattern(26), 0, 0.2), new OnPattern(40, 1)
        );
        const spookyHallwayMid = new Event(
            "hallway_1", new OffPattern(8), new SoundPattern("resources/electric_drone.mp3", new FlickerPattern(18), 0, 0.5), new OnPattern(40, 1)
        );
        const spookyHallwayBack = new Event(
            "hallway_2", new OffPattern(14), new SoundPattern("resources/creepy_child.mp3", new FlickerPattern(12), 0, 0.5), new OnPattern(40, 1)
        );
        const spookyHallwayRoofStart = new Event(
            "roofstairs_1", new OffPattern(16), new FlickerPattern(10), new OnPattern(40, 1)
        );
        const spookyHallwayRoofEnd = new Event(
            "roofstairs_2", new OffPattern(23), new FlickerPattern(5), new OnPattern(40, 1)
        );

        super("Trippy Hallway", [spookyHallwayTop, spookyHallwayMid, spookyHallwayBack, spookyHallwayRoofStart, spookyHallwayRoofEnd], [], 2)
    }
}

/**
 *
 */
class PulseAllLightsScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const hue: SpookyHueApi = await hueFunction()
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(hue);
        const allLights = await hue.getLights();
        const pattern = new Event("hallway_2",
            new OnPattern(100, 1, 1),
            new OffPattern(1, 1),
            new OnPattern(100, 1, 1),
            new OffPattern(1, 1),
            new OnPattern(100, 1, 1),
            new OffPattern(1, 1),
            new OnPattern(100, 1, 1),
        );

        while (true) {
            for (let i = 0; i < allLights.length; i++) {
                log.info(`Pulsing light #${allLights[i].id}`)
                await spookyHueBulbPlayer.playPattern(pattern);
            }
        }
    }
}

/**
 * Scene that repeats forever
 */
abstract class RepeatingScene extends Scene {

    private mainLightNames: string[]

    constructor(...mainLightNames: string[]) {
        super()
        this.mainLightNames = mainLightNames
    }

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());
        // Setup infinitely repeating light patterns
        this.getRepeatingEvents(...this.mainLightNames).forEach(event => {
            spookyHueBulbPlayer.playRepeatingEvent(event);
        })
    }

    abstract getRepeatingEvents(...lightNames: string[]): Event[];
}

class PulsingRedScene extends RepeatingScene {

    getRepeatingEvents(...lightNames: string[]): Event[] {
        return getPulsingRedEvent(...lightNames)
    }
}

class TestScene extends MultiPartScene {

    constructor() {
        super("Front Gate",
            getElectricLadyEvent("living_room_2", "living_room_1"),
            getChillEvents("living_room_2", "living_room_1"))
    }
}

class SensorTestScene extends Scene {

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const hue: SpookyHueApi = await hueFunction()
        const all_sensors: HueSensor[] = await hue.getSensors();

        log.info(`sensor count ${all_sensors.length} -> ${all_sensors}`);


        all_sensors.forEach((s: HueSensor) => {
            log.info(`sensor: ${JSON.stringify(s.getId())}`)
            // log.info(`Adding callback for ${s.getId()}`)
            s.addCallback((update: HueSensorUpdate) => {
                log.info(`Update received on sensor ${s.getId()} -> ${update.getPresence()}`)
            });

            s.start();
        });

        while (true) {
            log.info("Waiting on sensor updates");
            await sleep(10000);
        }
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export const SCENES: { [key: string]: Scene } = {
    "front_door": new ChromecastScene(),
    "hallway": new HallwayScene(),
    "find_lights": new PulseAllLightsScene(),
    "pulse_red": new PulsingRedScene(),
    "half_bath": new HalfBathroomScene(),
    "down_bath": new DownstairsBathroomScene(),
    "living_room": new LivingRoomScene(),
    "test": new TestScene(),
    "sensor_test": new SensorTestScene()
}
