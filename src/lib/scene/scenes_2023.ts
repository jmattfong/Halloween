import { Chromecaster } from '../chromecast';
import { getLogger } from '../logging';
import { CategoryLogger } from 'typescript-logging';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, RandomSoundPattern, FlickerPattern, OffPattern, SleepPattern, OnPattern, Pattern, PulsePattern, StableColourPattern, sleep } from './patterns';
import { Event } from "./events";
import { Scene, RandomMultiScene, MultiPartScene, AutoResetRingScene, RepeatingScene } from './scenes';
import { VIDEOS_2023, PORTAL_TO_HELL } from '../videos';
import { RED, SOFT_RED, RELAX, ORANGE, BLUE, CONCENTRATE } from '../config';
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
                new RandomSoundPattern([`${RESOURCES_DIR}/david_thunder_and_clowns.wav`,
                                        `${RESOURCES_DIR}/david_thunder.wav`,
                                        `${RESOURCES_DIR}/lightning_bolt.mp3`,
                                        `${RESOURCES_DIR}/lightning_bolt_2.mp3`,
                                        `${RESOURCES_DIR}/thunder_sound_1.mp3`,
                                        `${RESOURCES_DIR}/thunder_sound_2.mp3`], 
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
                new FlickerPattern(4),
                new OffPattern(1),
                new StableColourPattern(RED, 60, 30, 0),
                DEFAULT_LIGHTING
            )
        });
        log.info(`other LIGHT: ${lights[lights.length - 1]}`)
        // events.push(new Event(lights[lights.length - 1],
        //     new SoundPattern(`${RESOURCES_DIR}/electric_lady/sparks.mp3`, new FlickerPattern(5), 0),
        //     new SoundPattern(`${RESOURCES_DIR}/electric_lady/woman_screaming.mp3`, new StableColourPattern(RED, 15, 30, 0), 0.5),
        //     defaultLighting
        // ));

        super(events, getUnspookyEvents(lights));
    }
}


class FrontLightFlickerScene extends MultiPartScene {
    constructor(lights: string[]) {
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new FlickerPattern(7),
                DEFAULT_LIGHTING);
        });
        super(events, getUnspookyEvents(lights));
    }
}

class DownstairsBathCreepyClownShowerScene extends AutoResetRingScene {
    constructor(mirrorLights: string[], showerLight: string) {
        let spookyEvents: Event[] = mirrorLights.map(light => {
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
            new SoundPattern(`${RESOURCES_DIR}/david_bathroom_clowns_pop.wav`, new OnPattern(RED, 10, 5), 10),
            new OffPattern(1)));

        super(spookyEvents);
    }
}

class WerewolfDoorJiggleScene extends Scene {

    spookyEvent: Event;
    constructor(dummyLight: string) {
        super();
        this.spookyEvent = new Event(dummyLight, new SoundPattern(`${RESOURCES_DIR}/david_scratching_dog.wav`, new SleepPattern(0), 0));
    }

    async run(spookyHueBulbPlayer: SpookyHueBulbPlayer, sensorType: SensorType, sensorTriggedOn: boolean): Promise<void> {
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
                new SoundPattern(`${RESOURCES_DIR}/david_the_beast.wav`, new OnPattern(SOFT_RED, 4), 0),
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
}

// TODO
class CalmingCockroachesScene extends AutoResetRingScene {
    constructor(mirrorLights: string[], showerLight: string) {

        let spookyEvents = mirrorLights.map(light => {
            return new Event(light,
                new OnPattern(RELAX, 13, 4),
                new PulsePattern(RED, 14, 0.5),
                new OnPattern(RELAX, 10, 5),
            );
        });

        spookyEvents.push(new Event(showerLight,
            new SoundPattern(`${RESOURCES_DIR}/david_psycho.wav`, new FlickerPattern(13.5, BLUE, 110), 0),
            new PulsePattern(RED, 14, 0.5),
            new OffPattern(6, 6),
        ));


        super(spookyEvents, false);
    }
}

class PsychoScene extends AutoResetRingScene {
    constructor(mirrorLights: string[], showerLight: string) {

        let spookyEvents = mirrorLights.map(light => {
            return new Event(light,
                new OnPattern(RELAX, 13, 4),
                new PulsePattern(RED, 14, 0.5),
                new OnPattern(RELAX, 10, 5),
            );
        });

        spookyEvents.push(new Event(showerLight,
            new SoundPattern(`${RESOURCES_DIR}/david_psycho.wav`, new FlickerPattern(13.5, BLUE, 110), 0),
            new PulsePattern(RED, 14, 0.5),
            new OffPattern(6, 6),
        ));


        super(spookyEvents, false);
    }
}

// TODO
class ScreamScene extends AutoResetRingScene {
    constructor(mirrorLights: string[], showerLight: string) {

        let spookyEvents = mirrorLights.map(light => {
            return new Event(light,
                new OnPattern(RELAX, 13, 4),
                new PulsePattern(RED, 14, 0.5),
                new OnPattern(RELAX, 10, 5),
            );
        });

        spookyEvents.push(new Event(showerLight,
            // TODO create this sound
            new SoundPattern(`${RESOURCES_DIR}/scream.mp3`, new FlickerPattern(13.5, BLUE, 110), 0),
            new PulsePattern(RED, 14, 0.5),
            new OffPattern(6, 6),
        ));

        super(spookyEvents, false);
    }
}

class CostumeContestScene extends Scene {
    async run(_spook_yHueBulbPlayer: SpookyHueBulbPlayer, _sensorType: SensorType, _sensorTriggedOn: boolean): Promise<void> {
        // TODO
    }
}

class ChromecastPortalToHell extends Scene {
    chromecaster: Chromecaster

    constructor() {
        super()
        // this should probably be instantiated outside of this method here
        // TODO figure out device name for new Chromecast
        this.chromecaster = new Chromecaster();
        this.chromecaster.start();
    }

    async run(_spook_yHueBulbPlayer: SpookyHueBulbPlayer, _sensorType: SensorType, _sensorTriggedOn: boolean): Promise<void> {
        while (true) {
            this.chromecaster.playVideo(PORTAL_TO_HELL);
            sleep(PORTAL_TO_HELL.getVideoLengthSeconds() * 1000 - 5);
        }
    }
}

class ChromecastGhosts extends Scene {
    chromecaster: Chromecaster

    constructor() {
        super()
        // this should probably be instantiated outside of this method here
        this.chromecaster = new Chromecaster();
        this.chromecaster.start();
    }

    async run(_spook_yHueBulbPlayer: SpookyHueBulbPlayer, _sensorType: SensorType, sensorTriggedOn: boolean): Promise<void> {
        if (sensorTriggedOn) {
            let video = VIDEOS_2023[Math.floor(Math.random() * VIDEOS_2023.length)];
            this.chromecaster.playVideo(video);
        }
    }
}

function get_photobooth_scene(): RandomMultiScene {
    const spookyScenes = [
        new WerewolfDoorJiggleScene(""),
        new LookItsWafflesScene([""]),
    ];
    return new RandomMultiScene(spookyScenes, []);
}

function get_downstairs_bathroom_scene(mirror_light_1: string, mirror_light_2: string, shower_light: string): RandomMultiScene {
    const spookyScenes = [
        new DownstairsBathCreepyClownShowerScene([mirror_light_1, mirror_light_2], shower_light),
        new ElectricLady([mirror_light_1, mirror_light_2, shower_light]),
        new PsychoScene([mirror_light_1, mirror_light_2], shower_light),
    ];
    return new RandomMultiScene(spookyScenes, []);
}

const LIGHTS = {
    "front_walkway": [
        
    ],
    "downstairs_entry": [

    ],
    "downstairs_bathroom": [
        "1", "2", "3"
    ],
    "half_bathroom": [
        "6", "7"
    ],
    "guest_bathroom": [
        "20", "21", "22"
    ],
    "guest_bedroom": [

    ],
}

export const SCENES_2023: { [key: string]: Scene; } = {
    // Scenes for the party
    // Main server's scenes
    "photobooth_spooks": get_photobooth_scene(),
    "costume_contest": new CostumeContestScene(),
    // Hank's scenes
    "down_bath_random": get_downstairs_bathroom_scene("1", "2", "3"),
    // Bill's scenes
    "welcome_inside": new ThunderScene(LIGHTS["half_bathroom"]),
    "front_light_flicker": new FrontLightFlickerScene(LIGHTS["front_walkway"]),
    // Dale's scene
    "calming_cockroaches": new CalmingCockroachesScene(["down_bath_1", "down_bath_2"], "down_bath_3"),
    // Boomhaur's scenes
    "scream": new ScreamScene(["guest_bathroom_mirror_1", "guest_bathroom_mirror_2"], "guest_bathroom_shower"),
    "chromecast_portal_to_hell": new ChromecastPortalToHell(),
    "chromecast_ghosts": new ChromecastGhosts(),

    // Test and Utility scenes
    "list": new ListOnLightsScene(),
    "get_light": new GetLight(21), // Change this to get the state of different lights by ID
    "find_bulb": new FindBulb(["down_bath_1", "down_bath_2", "down_bath_3", "living_room_3", "living_room_4"]),
    "find_bulb_2": new FindBulb(["halloween_hallway_2", "halloween_hallway_3", "guest_bathroom_shower", "garage_2"]),
    "find_bulb_3": new FindBulb(["down_bath_1", "down_bath_2", "down_bath_3", "living_room_3", "living_room_4"]),

    // Test individual scenes
    "creepy_clown_shower": new DownstairsBathCreepyClownShowerScene(["down_bath_1", "down_bath_2"], "down_bath_3"),
    "psycho": new PsychoScene(["guest_bathroom_mirror_1", "guest_bathroom_mirror_2"], "guest_bathroom_shower"),
    "electric_lady": new ElectricLady(["guest_bathroom_mirror_1", "guest_bathroom_mirror_2", "guest_bathroom_shower"]),
    "werewolf_door_jiggle": new WerewolfDoorJiggleScene("master_1"),
    "look_its_waffles": new LookItsWafflesScene(["living_room_3"]),
};

const DEV_SCENE = "welcome_inside"
SCENES_2023["dev_scene"] = SCENES_2023[DEV_SCENE];
