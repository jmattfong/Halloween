import { HueSensorUpdate, HueSensor } from '../hue/sensor';
import { Chromecaster } from '../chromecast';
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from '../ring';
import { SpookyHueApi } from '../hue/hue';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, RandomSoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './patterns';
import { Event } from "./events"
import {Scene, MultiPartScene} from './scenes'
import {INTRO_VIDEO_2022} from '../videos'
import {RED, RELAX, CONCENTRATE, ENERGIZE, DIMMED,  NIGHTLIGHT} from '../config'

const log: CategoryLogger = getLogger("scene_2022")

/**
 * List all lights that are on
 */
 class ListOnLightsScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const hue: SpookyHueApi = await hueFunction()
        const allLights = await hue.getLights();

        let lights: Object[] = []

        for (let i = 0; i < allLights.length; i++) {
            let light = allLights[i]
            let on = light["_data"]["state"]["on"]
            let reachable = light["_data"]["state"]["reachable"]
            if (on && reachable) {
                log.info(`Light is on: ${JSON.stringify(light)}`)

                let light_config = {
                    "id": light["_data"]["id"],
                    "type": light["_data"]["type"],
                    "name": light["_data"]["name"],
                    "productname": light["_data"]["productname"]
                }
                lights.push(light_config)
            }
        }

        log.info(`Light config for ON and REACHABLE lights:\n ${JSON.stringify(lights)}`)
    }
}

class GetLight extends Scene {
    lightIdToGet: number
    constructor(lightIdToGet: number) {
        super()
        this.lightIdToGet = lightIdToGet
    }

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const hue: SpookyHueApi = await hueFunction()
        const allLights = await hue.getLights();

        for (let i = 0; i < allLights.length; i++) {
            let light = allLights[i]
            let id = light["_data"]["id"]
            if (id == this.lightIdToGet) {
                log.info(`Light: ${JSON.stringify(light)}`)
                return
            }
        }
        log.info(`Could not find light with id ${this.lightIdToGet}`)
    }
}

class FindBulb extends MultiPartScene {
    constructor(ringSensorName: string, lights: string[]) {
        let defaultLighting: Pattern = new OnPattern(RELAX, 3)
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
                defaultLighting)
        });
        let unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting)
        });
        super(ringSensorName, events, unSpookyEvents)
    }
}

class TestRingScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const ring: RingEnhancedSpookinatorV2 = await _ringFunction()
        ring.getSensors();
    }
}

class ThunderScene extends MultiPartScene {
    constructor(ringSensorName: string, lights: string[]) {
        let defaultLighting: Pattern = new OnPattern(RELAX, 1)
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new RandomSoundPattern(["resources/lightning_bolt.mp3", "resources/lightning_bolt_2.mp3"], new FlickerPattern(3), 0, 1),
                defaultLighting)
        });
        let unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting)
        });
        unSpookyEvents = []
        super(ringSensorName, events, unSpookyEvents)
    }
}

class FrontLightFlickerScene extends MultiPartScene {
    constructor(hueSensorId: number, lights: string[]) {
        let defaultLighting: Pattern = new OnPattern(RELAX, 1)
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new FlickerPattern(7),
                defaultLighting)
        });
        let unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting)
        });
        super("", events, unSpookyEvents, hueSensorId)
    }
}

// TODO
class JigglingSkeletonScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class FrontDoorVideoScene extends Scene {

    hueSensor: number
    constructor(hueSensor: number) {
        super()
        this.hueSensor = hueSensor
    }

    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        const chromecaster = new Chromecaster()
        await chromecaster.start();
        this.hueCallback = [
            this.hueSensor,
            (update: HueSensorUpdate) => {
                log.info(`received status update: ${update}`);
                if (update.getPresence()) {
                    // TODO this video needs to be updated
                    chromecaster.playVideo(INTRO_VIDEO_2022);
                }
            }
        ]
    }
}

class WelcomeInsideScene extends ThunderScene {
    constructor(ringSensorName: string, lights: string[]) {
        super(ringSensorName, lights)
    }
}

class PhotoboothThunderScene extends ThunderScene {
    constructor(ringSensorName: string, lights: string[]) {
        super(ringSensorName, lights)
    }
}

// TODO
class DownstairsBathCreepyClownShowerScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

// TODO
class WerewolfDoorJiggleScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

// TODO
class LookItsWafflesScene extends MultiPartScene {
    constructor(ringSensorName: string, lights: string[]) {
        let defaultLighting: Pattern = new OffPattern(1, 0)
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new SleepPattern(5),
                new RandomSoundPattern(["resources/alien_creature.mp3"], new OnPattern(RED, 15), 0, 1),
                defaultLighting)
        });
        let unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting)
        });
        super(ringSensorName, events, unSpookyEvents, undefined, true)
    }
}

// TODO
class WerewolfShowerScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

// TODO
class GuestBedClownScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

// TODO
class PortalToHellScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

export const SCENES_2022: { [key: string]: Scene } = {
    // Test and Utility scenes
    "list": new ListOnLightsScene(),
    "get_light": new GetLight(18), // Change this to get the state of different lights by ID
    "test_ring": new TestRingScene(),
    "find_bulb": new FindBulb("Front Gate", ["living_room_3"]),
    // Scenes for the party
    "front_light_flicker": new FrontLightFlickerScene(2, ["living_room_1", "living_room_2"]),
    "jiggling_skeleton": new JigglingSkeletonScene(),
    "front_door_video": new FrontDoorVideoScene(2),
    "welcome_inside": new WelcomeInsideScene("Front Gate", ["living_room_1", "living_room_2"]),
    "photobooth_thunder": new PhotoboothThunderScene("Front Gate", ["living_room_1", "living_room_2"]),
    "creepy_clown_shower": new DownstairsBathCreepyClownShowerScene(),
    "werewolf_door_jiggle": new WerewolfDoorJiggleScene(),
    "look_its_waffles": new LookItsWafflesScene("Front Gate", ["living_room_3"]),
    "werewolf_shower": new WerewolfShowerScene(),
    "guest_bed_clown": new GuestBedClownScene(),
    "portal_to_hell": new PortalToHellScene(),
}

