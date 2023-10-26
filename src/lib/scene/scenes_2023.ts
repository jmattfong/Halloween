import { Chromecaster } from '../chromecast';
import { getLogger } from '../logging';
import { CategoryLogger } from 'typescript-logging';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, RandomSoundPattern, FlickerPattern, OffPattern, SleepPattern, OnPattern, Pattern, PulsePattern, StableColourPattern, sleep } from './patterns';
import { Event } from "./events";
import { Scene, RandomMultiScene, MultiPartScene, AutoResetRingScene, RepeatingScene } from './scenes';
import { VIDEOS_2023, PORTAL_TO_HELL } from '../videos';
import { RED, PURP, SOFT_RED, RELAX, ORANGE, BLUE, CONCENTRATE } from '../config';
import { SensorType } from "../web_listener/webserver";

const log: CategoryLogger = getLogger("scenes_2023");

const RESOURCES_DIR: String = "resources/2023_sounds";

const DEFAULT_LIGHTING: Pattern = new OnPattern(RELAX, 3);

function getUnspookyEvents(lights: string[]) {
    return lights.map(light => {
        return new Event(light, DEFAULT_LIGHTING);
    });
}

/**
 * List all lights that are on
 */
class ListOnLightsScene extends Scene {
    async run(spookyHueBulbPlayer: SpookyHueBulbPlayer, sensorType: SensorType, sensorTriggedOn: boolean): Promise<void> {

        const allLights = await spookyHueBulbPlayer.api.getLights();

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

    async run(spookyHueBulbPlayer: SpookyHueBulbPlayer, sensorType: SensorType, sensorTriggedOn: boolean): Promise<void> {
        const allLights = await spookyHueBulbPlayer.api.getLights();

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
    constructor(lights: string[]) {
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING,
                new OnPattern(RED, 10),
                DEFAULT_LIGHTING);
        });
        super(events, getUnspookyEvents(lights));
    }
}

class ThunderScene extends MultiPartScene {
    constructor(lights: string[]) {
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new RandomSoundPattern([`${RESOURCES_DIR}/thunder/david_thunder_and_clowns.mp3`,
                `${RESOURCES_DIR}/thunder/david_thunder.mp3`,
                `${RESOURCES_DIR}/thunder/lightning_bolt.mp3`,
                `${RESOURCES_DIR}/thunder/lightning_bolt_2.mp3`,
                `${RESOURCES_DIR}/thunder/thunder_sound_1.mp3`,
                `${RESOURCES_DIR}/thunder/thunder_sound_2.mp3`],
                    new FlickerPattern(3)),
                DEFAULT_LIGHTING);
        });
        super(events, getUnspookyEvents(lights));
    }
}

class ElectricLady extends MultiPartScene {
    /// We attach the sound to the last light in the list so only one sound plays
    /// at a time
    constructor(lights: string[]) {
        var events: Event[] = lights.slice(0, -1).map(light => {
            log.info(`my LIGHT: ${light}`)
            return new Event(light,
                new FlickerPattern(3),
                new OffPattern(1),
                new StableColourPattern(RED, 60, 30, 0),
                DEFAULT_LIGHTING
            )
        });
        log.info(`other LIGHT: ${lights[lights.length - 1]}`)
        events.push(new Event(lights[lights.length - 1],
            new SoundPattern(`${RESOURCES_DIR}/electric_lady/sparks.mp3`, new FlickerPattern(4), 0),
            new SoundPattern(`${RESOURCES_DIR}/electric_lady/woman_screaming.mp3`, new StableColourPattern(RED, 15, 30, 0), 0.5),
            DEFAULT_LIGHTING
        ));

        super(events, getUnspookyEvents(lights));
    }
}


class FrontLightFlickerScene extends AutoResetRingScene {
    constructor(lights: string[]) {
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new FlickerPattern(7, {bri: 50}),
                DEFAULT_LIGHTING);
        });
        super(events);
    }
}

class DownstairsBathCreepyClownShowerScene extends AutoResetRingScene {
    constructor(lights: string[]) {
        let showerLight = lights.pop();

        let spookyEvents: Event[] = lights.map(light => {
            return new Event(light,
                new SleepPattern(0.0125),
                new FlickerPattern(5),
                new OnPattern(RELAX, 5, 5),
                new OffPattern(1, 5),
                new SleepPattern(13),
                new FlickerPattern(3),
                new OnPattern(RELAX, 1, 10));
        });

        spookyEvents.push(new Event(showerLight,
            new SoundPattern(`${RESOURCES_DIR}/david_bathroom_clowns_pop.mp3`, new OnPattern(RED, 10, 5), 10),
            new OffPattern(1)));

        super(spookyEvents);
    }
}

class WerewolfDoorJiggleScene extends Scene {

    spookyEvent: Event;
    constructor() {
        super();
        this.spookyEvent = new Event("", new SoundPattern(`${RESOURCES_DIR}/david_scratching_dog.mp3`, new SleepPattern(0), 0));
    }

    async run(spookyHueBulbPlayer: SpookyHueBulbPlayer, _sensorType: SensorType, sensorTriggedOn: boolean): Promise<void> {
        log.info(`WerewolfDoorJiggleScene got callback with sensor ${sensorTriggedOn}`)
        if (sensorTriggedOn) {
            spookyHueBulbPlayer.playPattern(this.spookyEvent);
        }
    }
}

class LookItsWafflesScene extends AutoResetRingScene {
    constructor(lights: string[]) {
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
                new SoundPattern(`${RESOURCES_DIR}/david_the_beast.mp3`, new OnPattern(SOFT_RED, 4), 0),
                new SleepPattern(0.1),
                new OffPattern(1),
                new OnPattern(SOFT_RED, 5),
                new OffPattern(2),
                new OnPattern(RED, 5),
                new OnPattern(SOFT_RED, 2),
                new OffPattern(1),
                new OnPattern(SOFT_RED, 8),
                new OffPattern(1),
                new OnPattern(RED, 9),
                new OffPattern(1, 1));
        });
        super(events, true);
    }

    async run(spookyHueBulbPlayer: SpookyHueBulbPlayer, sensorType: SensorType, sensorTriggedOn: boolean): Promise<void> {
        log.info(`LookItsWafflesScene got a callback with sensor ${sensorTriggedOn}`)
        await super.run(spookyHueBulbPlayer, sensorType, sensorTriggedOn);
    }
}

// Song is 161 seconds long
class CalmingCockroachesScene extends MultiPartScene {
    constructor(lights: string[]) {
        let spookyEvents = [
            new Event(lights[0],
                new SoundPattern(`${RESOURCES_DIR}/calming_cockroaches/enya_bugs.mp3`, new OnPattern(PURP, 150, 11), 0, 1, true),
                new OffPattern(6, 6),
            ),
            new Event(lights[1],
                new OnPattern(RELAX, 13, 4),
                new OnPattern(RELAX, 10, 5),
            ),
        ];

        const unspookyEvents = lights.map(light => {
            return new Event(light, new OnPattern(PURP, 150, 11));
        });

        super(spookyEvents, unspookyEvents, false);
    }
}

class PsychoScene extends AutoResetRingScene {
    constructor(lights: string[]) {
        let showerLight = lights.pop();

        let spookyEvents = lights.map(light => {
            return new Event(light,
                new OnPattern(RELAX, 13, 4),
                new PulsePattern(RED, 14, 0.5),
                new OnPattern(RELAX, 10, 5),
            );
        });

        spookyEvents.push(new Event(showerLight,
            new SoundPattern(`${RESOURCES_DIR}/david_psycho.mp3`, new FlickerPattern(13.5, BLUE, 110), 0),
            new PulsePattern(RED, 14, 0.5),
            new OffPattern(6, 6),
            new OnPattern(RELAX, 10, 5)
        ));


        super(spookyEvents, false);
    }
}

// Song is 66 seconds long, first 10 sec are silent
class ScreamScene extends AutoResetRingScene {
    constructor(lights: string[]) {

        let spookyEvents = lights.map(light => {
            return new Event(light,
                new SoundPattern(`${RESOURCES_DIR}/scream/scream_bathroom.mp3`, new OnPattern(RED, 45, 10), 0),
                new OnPattern(RELAX, 20, 0.5),
                new OffPattern(10, 0.2),
                new OnPattern(RELAX, 1, 1)
            );
        });

        super(spookyEvents, false);
    }
}

class HellBathroomCostumeScene extends AutoResetRingScene {
    constructor(lights: string[]) {

        let spookyEvents = lights.map(light => {
            return new Event(light,
                new SoundPattern(`${RESOURCES_DIR}/david_demon/david_rooftop_costume_contest.mp3`, new FlickerPattern(2), 0),
                new OnPattern(RED, 35, 0.5),
                new OnPattern(RELAX, 1, 1)
            );
        });

        super(spookyEvents, false);
    }
}

class HellBathroomFeedingScene extends AutoResetRingScene {
    constructor(lights: string[]) {

        let spookyEvents = lights.map(light => {
            return new Event(light,
                new SoundPattern(`${RESOURCES_DIR}/david_demon/david_rooftop_feeding.mp3`, new FlickerPattern(2), 0),
                new OnPattern(RED, 35, 0.5),
                new OnPattern(RELAX, 1, 1)
            );
        });

        super(spookyEvents, false);
    }
}

class HellBathroomWolfScene extends AutoResetRingScene {
    constructor(lights: string[]) {

        let spookyEvents = lights.map(light => {
            return new Event(light,
                new SoundPattern(`${RESOURCES_DIR}/david_demon/david_rooftop_werewolf.mp3`, new FlickerPattern(2), 0),
                new OnPattern(RED, 35, 0.5),
                new OnPattern(RELAX, 1, 1)
            );
        });

        super(spookyEvents, false);
    }
}

class CostumeContestGatherScene extends AutoResetRingScene {
    constructor(device_name: string) {
        let lights = []
        switch (device_name) {
            case "bill":
                lights = ["8", "9", "17", "25"]
                break;

            case "dale":
                lights = ["6", "7"]
                break;

            case "hank":
                lights = ["1", "2", "3"]
                break;

            case "boomhauer":
                lights = ["20", "21", "22"]
                break;

            default:
                break;
        }

        let spookyEvents = lights.map(light => {
            return new Event(light,
                new SoundPattern(`${RESOURCES_DIR}/costume_contest/costume_contest_23_gather.mp3`, new FlickerPattern(3), 0),
                new OnPattern(RELAX, 20, 0.5)
            );
        });

        super(spookyEvents, false);
    }
}

// song is 140 seconds
class SpookyScaryScene extends AutoResetRingScene {
    constructor(device_name: string) {
        let lights = []
        switch (device_name) {
            case "bill":
                lights = ["8", "9", "17", "25"]
                break;

            case "dale":
                lights = ["6", "7"]
                break;

            case "hank":
                lights = ["1", "2", "3"]
                break;

            case "boomhauer":
                lights = ["20", "21", "22"]
                break;

            default:
                break;
        }

        let spookyEvents = lights.map(light => {
            return new Event(light,
                new SoundPattern(`${RESOURCES_DIR}/spooky/spooky_scary.mp3`, new OnPattern(RED, 12, 0.5), 0),
                new OnPattern(RELAX, 12, 0.5),
                new OnPattern(RED, 13, 0.5),
                new OnPattern(RELAX, 13, 0.5),
                new OnPattern(RED, 12, 0.5),

            );
        });

        super(spookyEvents, false);
    }
}

class CostumeContestVoteScene extends AutoResetRingScene {
    constructor(device_name: string) {
        let lights = []
        switch (device_name) {
            case "bill":
                lights = ["8", "9", "17", "25"]
                break;

            case "dale":
                lights = ["6", "7"]
                break;

            case "hank":
                lights = ["1", "2", "3"]
                break;

            case "boomhauer":
                lights = ["20", "21", "22"]
                break;

            default:
                break;
        }

        let spookyEvents = lights.map(light => {
            return new Event(light,
                new SoundPattern(`${RESOURCES_DIR}/costume_contest/costume_contest_23_vote.mp3`, new FlickerPattern(3), 0),
                new OnPattern(RELAX, 20, 0.5)
            );
        });

        super(spookyEvents, false);
    }
}

class ChromecastScene extends Scene {
    chromecaster: Chromecaster
    started: boolean
    deviceId: string

    constructor(deviceId: string) {
        super()
        // this should probably be instantiated outside of this method here
        // TODO figure out device name for new Chromecast
        this.started = false;
        this.deviceId = deviceId;
    }

    async start() {
        if (!this.started) {
            log.info(`Starting chromecast ${this.deviceId}`)
            this.chromecaster = new Chromecaster(this.deviceId);
            await this.chromecaster.start();
            this.started = true;
        }
    }

    async run(_spook_yHueBulbPlayer: SpookyHueBulbPlayer, _sensorType: SensorType, _sensorTriggedOn: boolean): Promise<void> {
        await this.start();
    }
}

class ChromecastPortalToHell extends ChromecastScene {
    async run(hue: SpookyHueBulbPlayer, type: SensorType, on: boolean): Promise<void> {
        log.info(`ChromecastPortalToHell got a callback with sensor ${on}`)
        await super.run(hue, type, on);
        while (true) {
            await this.chromecaster.playVideo(PORTAL_TO_HELL);
            await sleep(PORTAL_TO_HELL.getVideoLengthSeconds() * 1000 - 5);
        }
    }
}

class ChromecastGhosts extends ChromecastScene {
    async run(hue: SpookyHueBulbPlayer, type: SensorType, sensorTriggedOn: boolean): Promise<void> {
        log.info(`ChromecastGhosts got a callback with sensor ${sensorTriggedOn}`)
        await super.run(hue, type, sensorTriggedOn);
        if (sensorTriggedOn) {
            let video = VIDEOS_2023[Math.floor(Math.random() * VIDEOS_2023.length)];
            await this.chromecaster.playVideo(video);
        }
    }
}

function get_photobooth_scene(): RandomMultiScene {
    const spookyScenes = [
        // new WerewolfDoorJiggleScene(),
        new ThunderScene(getLights("guest_bedroom"))
    ];
    return new RandomMultiScene(spookyScenes, []);
}

function get_downstairs_bathroom_scene(lights: string[]): RandomMultiScene {

    const spookyScenes = [
        new HellBathroomCostumeScene(Object.assign([], lights)),
        new HellBathroomFeedingScene(Object.assign([], lights)),
        new HellBathroomWolfScene(Object.assign([], lights)),
        new DownstairsBathCreepyClownShowerScene(Object.assign([], lights)),
        new ElectricLady(Object.assign([], lights)),
        new PsychoScene(Object.assign([], lights)),
        new DownstairsBathCreepyClownShowerScene(Object.assign([], lights)),
        new ElectricLady(Object.assign([], lights)),
        new PsychoScene(Object.assign([], lights)),
        new DownstairsBathCreepyClownShowerScene(Object.assign([], lights)),
        new ElectricLady(Object.assign([], lights)),
        new PsychoScene(Object.assign([], lights)),
    ];

    return new RandomMultiScene(spookyScenes, []);
}

const LIGHTS = {
    "front_walkway": [
        "24", "17"
    ],
    "downstairs_entry": [
        "17", "25"
    ],
    "downstairs_bathroom": [
        "1", "2", "3"
    ],
    "half_bathroom": [
        "6", "7"
    ],
    "guest_bathroom": [
        "20", "32", "22"
    ],
    "guest_bedroom": [
        "23", "31"
    ],
} as const

function getLights(roomName: string): string[] {
    return Object.assign([], LIGHTS[roomName]);
}

export function getScenes(device_name: string): { [key: string]: Scene; } {
    let main_scenes = {
        // Scenes for the party
        // Main server's scenes
        "photobooth_spooks": get_photobooth_scene(),
        "chromecast_portal_to_hell": new ChromecastPortalToHell("Chromecast-HD-36a10199048bd09c03c63e7f05c555c2"),
        "chromecast_ghosts": new ChromecastGhosts("Chromecast-70c4c8babee87879b01e6d819b6b5e97"),
        // Hank's scenes
        "down_bath_random": get_downstairs_bathroom_scene(getLights("downstairs_bathroom")),
        // Bill's scenes
        "welcome_inside": new ThunderScene(getLights("half_bathroom")),
        "front_light_flicker": new FrontLightFlickerScene(getLights("front_walkway")),
        // Dale's scene
        "calming_cockroaches": new CalmingCockroachesScene(getLights("half_bathroom")),
        // Boomhaur's scenes
        "scream": new ScreamScene(getLights("guest_bathroom")),
        // Global scenes
        "costume_contest_gather": new CostumeContestGatherScene(device_name),
        "costume_contest_vote": new CostumeContestVoteScene(device_name),
        "spooky_scary": new SpookyScaryScene(device_name),
        // Test individual scenes
        "creepy_clown_shower": new DownstairsBathCreepyClownShowerScene(getLights("half_bathroom")),
        "psycho": new PsychoScene(getLights("half_bathroom")),
        "electric_lady": new ElectricLady(getLights("half_bathroom")),
        "werewolf_door_jiggle": new WerewolfDoorJiggleScene(),
        "look_its_waffles": new LookItsWafflesScene(getLights("half_bathroom")),

        // Test and Utility scenes
        "list": new ListOnLightsScene(),
        "get_light": new GetLight(21), // Change this to get the state of different lights by ID
        "find_bulb": new FindBulb(["0", "1", "2", "3", "4"]),
        "find_bulb_2": new FindBulb(["5", "6", "7", "8"]),
        "find_bulb_3": new FindBulb(["9", "10", "11", "12", "13"]),
    }

    main_scenes["dev_scene"] = main_scenes["down_bath_random"];

    return main_scenes;
};

