import { HueSensorUpdate, HueSensor } from '../hue/sensor';
import { Chromecaster } from '../chromecast';
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from '../ring';
import { SpookyHueApi } from '../hue/hue';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './patterns';
import { red, white, blueish_white } from '../hue/colour';
import { Event, getElectricLadyEvent, getChillEvents, getPulsingRedEvent, getSpookyCockroachScene, getSpookyGhostScene, getAlienEvents, getCandymanScene, getChildRedEvent, getMichaelMyersScene, getSawScene, getFreddyScene } from "./events"
import {Scene, MultiPartScene} from './scenes'

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

    // Change this to get the state of different lights
    lightIdToGet: number = 26

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

class BlinkLight extends Scene {
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

        for (let i = 0; i < allLights.length; i++) {
            log.info(`Pulsing light #${allLights[i].id}`)
            await spookyHueBulbPlayer.playPattern(pattern);
        }
    }
}

class FrontLightFlickerScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class JigglingSkeletonScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class FrontDoorVideoScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class WelcomeInsideScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class PhotoboothThunderScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class DownstairsBathCreepyClownShowerScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class WerewolfDoorJiggleScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class LookItsWafflesScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class WerewolfShowerScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class GuestBedClownScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

class PortalToHellScene extends Scene {
    async setup(_ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
    }
}

export const SCENES_2022: { [key: string]: Scene } = {
    "list": new ListOnLightsScene(),
    "get_light": new GetLight(),
    "blink": new BlinkLight(),
    "front_light_flicker": new FrontLightFlickerScene(),
    "jiggling_skeleton": new JigglingSkeletonScene(),
    "front_door_video": new FrontDoorVideoScene(),
    "welcome_inside": new WelcomeInsideScene(),
    "photobooth_thunder": new PhotoboothThunderScene(),
    "creepy_clown_shower": new DownstairsBathCreepyClownShowerScene(),
    "werewolf_door_jiggle": new WerewolfDoorJiggleScene(),
    "look_its_waffles": new LookItsWafflesScene(),
    "werewolf_shower": new WerewolfShowerScene(),
    "guest_bed_clown": new GuestBedClownScene(),
    "portal_to_hell": new PortalToHellScene(),
}

