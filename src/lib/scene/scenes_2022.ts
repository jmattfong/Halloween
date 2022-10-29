import { HueSensorUpdate, HueSensor } from '../hue/sensor';
import { Chromecaster } from '../chromecast';
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from '../ring';
import { SpookyHueApi } from '../hue/hue';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, RandomSoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './patterns';
import { Event } from "./events"
import { Scene, MultiPartScene, AutoResetRingScene, RepeatingScene } from './scenes'
import { INTRO_VIDEO_2022 } from '../videos'
import { CONFIG, RED, SOFT_RED, RELAX, CONCENTRATE, ENERGIZE, DIMMED, NIGHTLIGHT, ORANGE } from '../config'

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
                new RandomSoundPattern(["resources/lightning_bolt.mp3", "resources/lightning_bolt_2.mp3"], new FlickerPattern(3)),
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

class DownstairsBathCreepyClownShowerScene extends AutoResetRingScene {
    constructor(ringSensorName: string, mirrorLights: string[], showerLight: string) {
        let spookyEvents: Event[] = mirrorLights.map(light => {
            return new Event(light,
                new FlickerPattern(5),
                new OnPattern(RELAX, 5, 5),
                new OffPattern(1, 5),
                new SleepPattern(13),
                new FlickerPattern(3),
                new OnPattern(RELAX, 1, 10));
        });

        spookyEvents.push(new Event(showerLight,
            new SoundPattern("resources/David_2022/downstairs_bathroom.mp3", new OnPattern(RED, 10, 5), 10),
            new OffPattern(1)))

        super(ringSensorName, spookyEvents)
    }
}

// TODO
class WerewolfDoorJiggleScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class LookItsWafflesScene extends AutoResetRingScene {
    constructor(ringSensorName: string, lights: string[]) {
        let events: Event[] = lights.map(light => {
            // 0-4 - growl
            // 5-10 growl
            // 12-14 LOUD
            // 15-17 LOUD
            // 17-19 growl
            // 21-24 growl
            // 25-28 growl
            // 29-31 LOUD
            // -32 LOUD
            return new Event(light,
                new SoundPattern("resources/David_2022/the_beast.mp3", new OnPattern(SOFT_RED, 4), 0),
                new OffPattern(1),
                new OnPattern(SOFT_RED, 5),
                new OffPattern(2),
                new OnPattern(RED, 5),
                new OnPattern(SOFT_RED, 2),
                new OffPattern(1),
                new OnPattern(SOFT_RED, 8),
                new OffPattern(1),
                new OnPattern(RED, 9),
                new OffPattern(1, 1))
        });
        super(ringSensorName, events, true)
    }
}

// TODO
class WerewolfShowerScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class GuestBedClownScene extends AutoResetRingScene {
    constructor(ringSensorName: string, lights: string[]) {
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new SleepPattern(7),
                // Oops, if we use multiple SoundPatterns it plays them all at once. Kinda works though?
                new RandomSoundPattern(["resources/saw_laugh.mp3", "resources/creepy_child.mp3"], new OffPattern(14)),
                new OnPattern(RELAX, 1, 1))
        });

        super(ringSensorName, events, true)
    }
}

class HalloweenHallway extends RepeatingScene {
    getRepeatingEvents(...lightNames: string[]): Event[] {
        lightNames
        let eventLights: string[][] = [[], [], [], [], []]
        let i = 0
        lightNames.forEach(light => {
            eventLights[i].push(light)
            i = (++i) % eventLights.length
        })

        log.info(`eventLights: ${JSON.stringify(eventLights)}`)

        let result = eventLights[0].map(light => {
            return new Event(light, new OnPattern(ORANGE, 1.5, 1), new OffPattern(1), new OffPattern(1), new OffPattern(1), new OffPattern(1))
        })
        result = result.concat(eventLights[1].map(light => {
            return new Event(light, new OffPattern(1), new OnPattern(ORANGE, 1.5, 1), new OffPattern(1), new OffPattern(1), new OffPattern(1))
        }))
        result = result.concat(eventLights[2].map(light => {
            return new Event(light, new OffPattern(1), new OffPattern(1), new OnPattern(ORANGE, 1.5, 1), new OffPattern(1), new OffPattern(1))
        }))
        result = result.concat(eventLights[3].map(light => {
            return new Event(light, new OffPattern(1), new OffPattern(1), new OffPattern(1), new OnPattern(ORANGE, 1.5, 1), new OffPattern(1))
        }))
        result = result.concat(eventLights[4].map(light => {
            return new Event(light, new OffPattern(1), new OffPattern(1), new OffPattern(1), new OffPattern(1), new OnPattern(ORANGE, 1.5, 1))
        }))
        log.info(`result: ${JSON.stringify(result)}`)
        return result
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
    "get_light": new GetLight(21), // Change this to get the state of different lights by ID
    "test_ring": new TestRingScene(),
    "find_bulb": new FindBulb("Waffles' Room", ["down_bath_1", "down_bath_2", "down_bath_3"]),
    // Scenes for the party
    "front_light_flicker": new FrontLightFlickerScene(2, ["living_room_1", "living_room_2"]),
    "front_door_video": new FrontDoorVideoScene(2),
    "welcome_inside": new WelcomeInsideScene("Front Gate", ["living_room_1", "living_room_2"]),
    "photobooth_thunder": new PhotoboothThunderScene("Front Gate", ["living_room_1", "living_room_2"]),
    "creepy_clown_shower": new DownstairsBathCreepyClownShowerScene("Waffles' Room", ["down_bath_1", "down_bath_2"], "down_bath_3"),
    "halloween_hallway": new HalloweenHallway("halloween_hallway_1", "halloween_hallway_2", "halloween_hallway_3", "halloween_hallway_4", "halloween_hallway_5"),
    "werewolf_door_jiggle": new WerewolfDoorJiggleScene(),
    "look_its_waffles": new LookItsWafflesScene("Front Gate", ["living_room_3"]),
    "werewolf_shower": new WerewolfShowerScene(),
    "guest_bed_clown": new GuestBedClownScene("Front Gate", ["master_1", "master_2", "master_3", "master_4"]),
    "portal_to_hell": new PortalToHellScene(),
}
