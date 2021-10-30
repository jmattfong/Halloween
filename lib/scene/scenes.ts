import { RingDeviceData } from 'ring-client-api'
import { HueSensorUpdate } from '../hue/sensor';
import { Chromecaster } from '../chromecast';
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from '../ring';
import { SpookyHueApi } from '../hue/hue';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './patterns';
import { red, white, blueish_white } from '../hue/colour';
import { Event, getElectricLadyEvent, getChillEvents, getPulsingRedEvent } from "./events"

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
                getPulsingRedEvent(subLightName, ...mainLightNames)
            ],
            getChillEvents(subLightName, ...mainLightNames))
    }
}

class HalfBathroomScene extends RandomSpookyScene {

    constructor() {
        super("Half Bathroom", "half_bath_3", "half_bath_2", "half_bath_1")
    }
}

class DownstairsBathroomScene extends MultiPartScene {

    constructor() {

        let spookyScreaminElectricScene = new Event("down_bath_1",
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern('resources/sparks.mp3', new FlickerPattern(5.5), 3),
            new OffPattern(1),
            new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(red, 60, 12, 0), 0.5),
            new StableColourPattern(white, 60, 10, 10)
        );

        let spookyCockroachScene = new Event("down_bath_2",
            new StableColourPattern(white, 5, 5, 0),
            new SoundPattern("resources/cockroach_walk.mp3", new StableColourPattern(white, 5, 2, 0), 1, 0.1),
            new SoundPattern("resources/cockroach_scurry_1.mp3", new StableColourPattern(blueish_white, 40, 1, 1), 0.01, 1),
            new SoundPattern("resources/cockroach_fight_1.mp3", new StableColourPattern(blueish_white, 50, 1, 1), 0.01, 0.5),
            new StableColourPattern(white, 60, 10, 10)
        );

        let spookyGhostScene = new Event("down_bath_3",
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern("resources/ghost_movement.mp3", new StableColourPattern(white, 70, 8, 7), 1, 0.2),
            new SoundPattern("resources/ghost_cry.mp3", new FlickerPattern(1), 0.01, 0.75),
            new StableColourPattern(white, 60, 10, 10)
        );

        let unspookyScene = new Event("down_bath_2",
            new StableColourPattern(white, 40, 10, 10),
            new StableColourPattern(white, 10, 10, 30)
        );

        super("Waffles' Room", [spookyGhostScene, spookyCockroachScene, spookyScreaminElectricScene], [unspookyScene])
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
            new OffPattern(1, 1)
        );

        while (true) {
            for (let i = 0; i < allLights.length; i++) {
                log.info(`Pulsing light #${allLights[i].id}`)
                await spookyHueBulbPlayer.playPattern(pattern);
            }
        }
    }
}

class PulsingRedScene extends Scene {

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());
        // Setup infinitely repeating light patterns
        getPulsingRedEvent("living_room_1").forEach(event => {
            spookyHueBulbPlayer.playRepeatingEvent(event);
        })
    }
}

class TestScene extends MultiPartScene {

    constructor() {
        super("Front Gate",
            getElectricLadyEvent("living_room_2", "living_room_1"),
            getChillEvents("living_room_2", "living_room_1"))
    }
}

export const SCENES: { [key: string]: Scene } = {
    "front_door": new ChromecastScene(),
    "hallway": new HallwayScene(),
    "find_lights": new PulseAllLightsScene(),
    "pulse_red": new PulsingRedScene(),
    "half_bath": new HalfBathroomScene(),
    "down_bath": new DownstairsBathroomScene(),
    "test": new TestScene()
}