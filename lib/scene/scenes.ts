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
import { Event } from "./events"

const log: CategoryLogger = getLogger("scene")

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

    name: string
    lightNames: string[]
    spookyEventChoices: Event[]
    unSpookyEvents: Event

    constructor(name: string, lightNames: string[], spookyEvents: Event[], unSpookyEvents: Event) {
        super()
        this.name = name
        this.lightNames = lightNames
        this.spookyEventChoices = spookyEvents
        this.unSpookyEvents = unSpookyEvents
    }

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());

        this.ringCallback = [this.name, (data: RingDeviceData) => {
            log.info(`callback called on ${data.name}`);

            // if the data.faulted is true, that means that the door is open and we should resort to the
            // unspooky base pattern
            // otherwise, pick a random pattern and play it!
            let patternWorkflow: Event;
            if (data.faulted) {
                patternWorkflow = this.unSpookyEvents;
            } else {
                const patternIndex = Math.floor(Math.random() * this.spookyEventChoices.length);
                log.debug(`choosing pattern #${patternIndex}`)
                patternWorkflow = this.spookyEventChoices[patternIndex];
            }

            this.lightNames.forEach(lightNames => {
                spookyHueBulbPlayer.playPattern(lightNames, patternWorkflow);
            });
        }];
    }
}

class HalfBathroomScene extends MultiPartScene {

    constructor() {

        let spookyScreaminElectricScene = new Event(
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern('resources/sparks.mp3', new FlickerPattern(5.5), 3),
            new OffPattern(1),
            new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(red, 60, 12, 0), 500),
            new StableColourPattern(white, 60, 10, 10)
        );

        let spookyCockroachScene = new Event(
            new StableColourPattern(white, 5, 5, 0),
            new SoundPattern("resources/cockroach_walk.mp3", new StableColourPattern(white, 5, 2, 0), 1000, 0.1),
            new SoundPattern("resources/cockroach_scurry_1.mp3", new StableColourPattern(blueish_white, 40, 1, 1), 10, 1),
            new SoundPattern("resources/cockroach_fight_1.mp3", new StableColourPattern(blueish_white, 50, 1, 1), 10, 0.5),
            new StableColourPattern(white, 60, 10, 10)
        );

        let spookyGhostScene = new Event(
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern("resources/ghost_movement.mp3", new StableColourPattern(white, 70, 8, 7), 1, 0.2),
            new SoundPattern("resources/ghost_cry.mp3", new FlickerPattern(1), 10, 0.75),
            new StableColourPattern(white, 60, 10, 10)
        );

        let spookyTown = new Event(
            new SoundPattern("resources/haunted_mansion_song_shortened.mp3", new PulsePattern(red, 25), 0, 0.75)
        );

        let unspookyScene = new Event(
            new StableColourPattern(white, 40, 10, 10),
            new StableColourPattern(white, 10, 10, 30)
        );

        // TODO: change the light # back to 16 & 21, which are the actual bathroom light numbers
        super("Half Bathroom", ["half_bath_1"], [spookyTown, spookyScreaminElectricScene, spookyCockroachScene, spookyGhostScene], unspookyScene)
    }
}

class DownstairsBathroomScene extends MultiPartScene {

    constructor() {

        let spookyScreaminElectricScene = new Event(
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern('resources/sparks.mp3', new FlickerPattern(5.5), 3),
            new OffPattern(1),
            new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(red, 60, 12, 0), 500),
            new StableColourPattern(white, 60, 10, 10)
        );

        let spookyCockroachScene = new Event(
            new StableColourPattern(white, 5, 5, 0),
            new SoundPattern("resources/cockroach_walk.mp3", new StableColourPattern(white, 5, 2, 0), 1000, 0.1),
            new SoundPattern("resources/cockroach_scurry_1.mp3", new StableColourPattern(blueish_white, 40, 1, 1), 10, 1),
            new SoundPattern("resources/cockroach_fight_1.mp3", new StableColourPattern(blueish_white, 50, 1, 1), 10, 0.5),
            new StableColourPattern(white, 60, 10, 10)
        );

        let spookyGhostScene = new Event(
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern("resources/ghost_movement.mp3", new StableColourPattern(white, 70, 8, 7), 1, 0.2),
            new SoundPattern("resources/ghost_cry.mp3", new FlickerPattern(1), 10, 0.75),
            new StableColourPattern(white, 60, 10, 10)
        );

        let unspookyScene = new Event(
            new StableColourPattern(white, 40, 10, 10),
            new StableColourPattern(white, 10, 10, 30)
        );

        super("Waffles' Room", ["down_bath_1","down_bath_2","down_bath_3"], [spookyGhostScene, spookyCockroachScene, spookyScreaminElectricScene], unspookyScene)
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

class HallwayScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());
        const hallwayPattern = new Event(
            new FlickerPattern(30),
        );

        this.hueCallback = [
            1,
            (update: HueSensorUpdate) => {
                if (update.getPresence()) {
                    spookyHueBulbPlayer.playPattern("hallway_2", hallwayPattern);
                }
            }
        ]
    }
}

class PulseAllLightsScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const hue: SpookyHueApi = await hueFunction()
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(hue);
        const allLights = await hue.getLights();
        const pattern = new Event(
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
                await spookyHueBulbPlayer.playPattern(allLights[i].id, pattern);
            }
        }
    }
}

class PulsingRedScene extends Scene {

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());
        const repeatingRedPulsingPattern = new Event(
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3)
        )
        // Setup infinitely repeating light patterns
        spookyHueBulbPlayer.playRepeatingEvent("waffles_room_1", repeatingRedPulsingPattern);
    }
}

class TestScene extends Scene {

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());
        const repeatingRedPulsingPattern = new Event(
            new StableColourPattern(red, 0, 1, 5)
        )
        // Setup infinitely repeating light patterns
        spookyHueBulbPlayer.playRepeatingEvent("waffles_room_1", repeatingRedPulsingPattern);
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
