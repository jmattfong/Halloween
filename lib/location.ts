import { RingDeviceData } from 'ring-client-api'
import { HueSensorUpdate, HueSensor } from './hue/sensor';
import { Chromecaster } from './chromecast';
import { getLogger } from './logging'
import { CategoryLogger } from 'typescript-logging';
import { RingEnhancedSpookinatorV2 } from './ring';
import { SpookyHueApi } from './hue/hue';
import { SpookyHueBulbPlayer } from './hue/spooky_bulb_player';
import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './scene/patterns';
import { red, white, blueish_white } from './hue/colour';
import { Event, getElectricLadyEvent, getChillEvents, getPulsingRedEvent, getSpookyCockroachScene, getSpookyGhostScene, getAlienEvents, getCandymanScene, getChildRedEvent, getMichaelMyersScene, getSawScene, getFreddyScene } from "./scene/events"
import { Scene } from './scene/scenes';

const log: CategoryLogger = getLogger("location")

/**
 * Hmm what was I up to...
 */
export class Location {
    primaryLights: [number]
    secondaryLights: [number]
    defaultScene: Scene
    spookyScene: Scene
    ringCallback: Promise<RingEnhancedSpookinatorV2>
    hueCallback: Promise<SpookyHueApi>

    constructor() {
        this.ringCallback = null
        this.hueCallback = null
    }

    setup(ringFunction: () => Promise<RingEnhancedSpookinatorV2>, hueFunction: () => Promise<SpookyHueApi>): Promise<void> {
        return Promise.resolve()
    }

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

export const LOCATIONS: { [key: string]: Location } = {
    "entryway": new Location([], []),
    "downstairs_hall": new Location([0, 25], [17]),
    "downstairs_bedroom": new Location([26, 30, 29], []),
    "downstaris_bathroom": new Location([22, 20], [3]),
    "main_bedroom": new Location([], []),
    "guest_bathroom": new Location([], []),
    "guest_bedroom": new Location([], []),
    "roof": new Location([], []),
}