import { RingDeviceData } from 'ring-client-api'
import { HueSensorUpdate } from './hue/sensor';
import { Chromecaster } from './chromecast';
import { getLogger } from './logging'
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from './ring';
import { SpookyHueApi } from './hue/hue';
import { SpookyHueBulbPlayer } from './hue/spooky_bulb_player';
import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern } from './hue/patterns';
import { red, white } from './hue/colour';

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

class Light {
    protected id: number;
    protected spookyPatterns: Pattern[];
    protected unspookyPatterns: Pattern[];

    constructor(id: number, spookyPatterns: Pattern[], unspookyPatterns: Pattern[]) {
        this.id = id;
        this.spookyPatterns = spookyPatterns;
        this.unspookyPatterns = unspookyPatterns;
    }

    public getId(): number {
        return this.id;
    }

    public getSpookyPatterns(): Pattern[] {
        return this.spookyPatterns;
    }

    public getUnspookyPatterns(): Pattern[] {
        return this.unspookyPatterns;
    }
}

class MultiPartScene extends Scene {

    name: string
    lights: Light[]

    constructor(name: string, lights: Light[]) {
        super()
        this.name = name
        this.lights = lights
    }

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());
        this.ringCallback = [this.name, (data: RingDeviceData) => {
            log.info(`callback called on ${data.name}`);

            this.lights.forEach(light => {
                let patternWorkflow = data.faulted ? light.getUnspookyPatterns() : light.getSpookyPatterns()
                spookyHueBulbPlayer.playPattern(light.getId(), patternWorkflow);
            });
        }]
    }
}

class HalfBathroomScene extends MultiPartScene {

    constructor() {
        super("Half Bathroom", [
            new Light(1, [
                new StableColourPattern(white, 40, 5, 0),
                new SoundPattern('resources/sparks.mp3', new FlickerPattern(5.5), 3),
                new OffPattern(1),
                new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(red, 60, 12, 0), 500),
                new StableColourPattern(white, 60, 10, 10)
            ], [
                new StableColourPattern(white, 40, 10, 10),
                new StableColourPattern(white, 10, 10, 30)
            ])])
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
        const hallwayPattern = [
            new FlickerPattern(30),
        ];

        this.hueCallback = [
            1,
            (update: HueSensorUpdate) => {
                if (update.getPresence()) {
                    spookyHueBulbPlayer.playPattern(4, hallwayPattern);
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
        const pattern = [
            new OnPattern(100, 1, 1),
            new OffPattern(1, 1),
            new OnPattern(100, 1, 1),
            new OffPattern(1, 1),
            new OnPattern(100, 1, 1),
            new OffPattern(1, 1)
        ];

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
        const repeatingRedPulsingPattern = [
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3)
        ]
        // Setup infinitely repeating light patterns
        spookyHueBulbPlayer.playRepeatingPattern(6, repeatingRedPulsingPattern);
        spookyHueBulbPlayer.playRepeatingPattern(7, repeatingRedPulsingPattern);
    }
}

class TestScene extends Scene {

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());
        const repeatingRedPulsingPattern = [
            new StableColourPattern(red, 0, 1, 5)
        ]
        // Setup infinitely repeating light patterns
        spookyHueBulbPlayer.playRepeatingPattern(6, repeatingRedPulsingPattern);
        spookyHueBulbPlayer.playRepeatingPattern(7, repeatingRedPulsingPattern);
    }
}

export const SCENES: { [key: string]: Scene } = {
    "front_door": new ChromecastScene(),
    "hallway": new HallwayScene(),
    "find_lights": new PulseAllLightsScene(),
    "pulse_red": new PulsingRedScene(),
    "half_bath": new HalfBathroomScene(),
    "test": new TestScene()
}