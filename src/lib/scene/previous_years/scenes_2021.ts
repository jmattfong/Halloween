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

        super("Trippy Hallway", [spookyHallwayTop, spookyHallwayMid, spookyHallwayBack, spookyHallwayRoofStart, spookyHallwayRoofEnd], [], 9)
    }
}

class RandomSpookyScene extends RandomMultiScene {
    constructor(ringSensor: string, subLightName: string, ...mainLightNames: string[]) {
        super(ringSensor,
            [
                getElectricLadyEvent(subLightName, ...mainLightNames),
                getCandymanScene(subLightName, ...mainLightNames),
                getMichaelMyersScene(subLightName, ...mainLightNames),
                getSawScene(...mainLightNames),
                getFreddyScene(...mainLightNames),
                getChildRedEvent(subLightName, ...mainLightNames),
                getSpookyCockroachScene(...mainLightNames),
                getSpookyGhostScene(...mainLightNames),
                getAlienEvents(subLightName, ...mainLightNames),
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

class PulsingRedScene extends RepeatingScene {

    getRepeatingEvents(...lightNames: string[]): Event[] {
        return getPulsingRedEvent(...lightNames)
    }
}

class TestScene extends MultiPartScene {

    constructor() {
        super("Half Bathroom",
            getFreddyScene("half_bath_3", "half_bath_2", "half_bath_1"),
            getChillEvents("half_bath_3", "half_bath_2", "half_bath_1"))
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
