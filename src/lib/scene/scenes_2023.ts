import { getLogger } from '../logging';
import { CategoryLogger } from 'typescript-logging';
import { SpookyHueBulbPlayer } from '../hue/spooky_bulb_player';
import { SoundPattern, RandomSoundPattern, FlickerPattern, OffPattern, SleepPattern, OnPattern, Pattern, PulsePattern, StableColourPattern } from './patterns';
import { Event } from "./events";
import { Scene, RandomMultiScene, MultiPartScene, AutoResetRingScene, RepeatingScene } from './scenes';
import { RED, SOFT_RED, RELAX, ORANGE, BLUE, CONCENTRATE } from '../config';
import { SensorType } from "../web_listener/webserver";

const log: CategoryLogger = getLogger("scenes_2023");

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
        let defaultLighting: Pattern = new OnPattern(RELAX, 3);
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
                defaultLighting);
        });
        let unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting);
        });
        super(events, unSpookyEvents);
    }
}
class ThunderScene extends MultiPartScene {
    constructor(lights: string[]) {
        let defaultLighting: Pattern = new OnPattern(RELAX, 1);
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new RandomSoundPattern(["resources/lightning_bolt.mp3", "resources/lightning_bolt_2.mp3"], new FlickerPattern(3)),
                defaultLighting);
        });
        let unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting);
        });
        unSpookyEvents = [];
        super(events, unSpookyEvents);
    }
}

class ElectricLady extends MultiPartScene {
    /// We attach the sound to the last light in the list so only one sound plays
    /// at a time
    constructor(lights: string[]) {
        let defaultLighting: Pattern = new OnPattern(RELAX, 1);
        var events: Event[] = lights.slice(0, -1).map(light => {
            log.info(`my LIGHT: ${light}`)
            return new Event(light,
                new FlickerPattern(4),
                new OffPattern(1),
                new StableColourPattern(RED, 60, 30, 0),
                defaultLighting
            )
        });
        log.info(`other LIGHT: ${lights[lights.length - 1]}`)
        events.push(new Event(lights[lights.length - 1],
            new SoundPattern("resources/sparks.mp3", new FlickerPattern(5), 0),
            new SoundPattern("resources/woman_screaming.mp3", new StableColourPattern(RED, 15, 30, 0), 0.5),
            defaultLighting
        ));

        const unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting);
        });
        super(events, unSpookyEvents);
    }
}


class FrontLightFlickerScene extends MultiPartScene {
    constructor(lights: string[]) {
        let defaultLighting: Pattern = new OnPattern(RELAX, 1);
        let events: Event[] = lights.map(light => {
            return new Event(light,
                new FlickerPattern(7),
                defaultLighting);
        });
        let unSpookyEvents: Event[] = lights.map(light => {
            return new Event(light, defaultLighting);
        });
        super(events, unSpookyEvents);
    }
}

class WelcomeInsideScene extends ThunderScene {
    constructor(lights: string[]) {
        super(lights);
    }
}

class PhotoboothThunderScene extends ThunderScene {
    constructor(lights: string[]) {
        super(lights);
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
            new SoundPattern("resources/David_2022/downstairs_bathroom.wav", new OnPattern(RED, 10, 5), 10),
            new OffPattern(1)));

        super(spookyEvents);
    }
}

class WerewolfDoorJiggleScene extends Scene {

    spookyEvent: Event;
    constructor(dummyLight: string) {
        super();
        this.spookyEvent = new Event(dummyLight, new SoundPattern("resources/David_2022/scratching_dog.wav", new SleepPattern(0), 0));
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
                new SoundPattern("resources/David_2022/the_beast.wav", new OnPattern(SOFT_RED, 4), 0),
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

class GuestBathroomScene extends AutoResetRingScene {
    constructor(mirrorLights: string[], showerLight: string) {

        let spookyEvents = mirrorLights.map(light => {
            return new Event(light,
                new OnPattern(RELAX, 13, 4),
                new PulsePattern(RED, 14, 0.5),
                new OnPattern(RELAX, 10, 5),
            );
        });

        spookyEvents.push(new Event(showerLight,
            new SoundPattern("resources/David_2022/guest_bathroom_psycho.wav", new FlickerPattern(13.5, BLUE, 110), 0),
            new PulsePattern(RED, 14, 0.5),
            new OffPattern(6, 6),
        ));


        super(spookyEvents, false);
    }
}

class HalloweenHallway extends RepeatingScene {
    getRepeatingEvents(...lightNames: string[]): Event[] {
        let eventLights: string[][] = [[], [], [], [], []];
        let i = 0;
        lightNames.forEach(light => {
            eventLights[i].push(light);
            i = (++i) % eventLights.length;
        });

        log.info(`eventLights: ${JSON.stringify(eventLights)}`);

        let result = eventLights[0].map(light => {
            return new Event(light, new OnPattern(ORANGE, 1.5, 1), new OffPattern(1), new OffPattern(1), new OffPattern(1), new OffPattern(1));
        });
        result = result.concat(eventLights[1].map(light => {
            return new Event(light, new OffPattern(1), new OnPattern(ORANGE, 1.5, 1), new OffPattern(1), new OffPattern(1), new OffPattern(1));
        }));
        result = result.concat(eventLights[2].map(light => {
            return new Event(light, new OffPattern(1), new OffPattern(1), new OnPattern(ORANGE, 1.5, 1), new OffPattern(1), new OffPattern(1));
        }));
        result = result.concat(eventLights[3].map(light => {
            return new Event(light, new OffPattern(1), new OffPattern(1), new OffPattern(1), new OnPattern(ORANGE, 1.5, 1), new OffPattern(1));
        }));
        result = result.concat(eventLights[4].map(light => {
            return new Event(light, new OffPattern(1), new OffPattern(1), new OffPattern(1), new OffPattern(1), new OnPattern(ORANGE, 1.5, 1));
        }));
        log.info(`result: ${JSON.stringify(result)}`);
        return result;
    }
}

class PortalToHellScene extends RepeatingScene {
    getRepeatingEvents(...lightNames: string[]): Event[] {
        let repeatTime = 5;
        let events = [
            new Event(lightNames[0], new OnPattern(RELAX, 1), new SleepPattern(repeatTime),
                new RandomSoundPattern(["resources/David_2022/rooftop_costume_contest.wav", "resources/David_2022/rooftop_feeding.wav", "resources/David_2022/rooftop_werewolf.wav"], new OffPattern(60)),
                new OnPattern(RELAX, 1)),
            new Event(lightNames[1], new OnPattern(RELAX, 1), new SleepPattern(repeatTime),
                new OffPattern(60),
                new OnPattern(RELAX, 1))
        ];
        for (var i = 1; i < lightNames.length; i++) {
            events.push(new Event(lightNames[0], new OnPattern(RELAX, 1), new SleepPattern(repeatTime),
                new OffPattern(60),
                new OnPattern(RELAX, 1)));
        }

        log.info(`PortalToHellScene events: ${JSON.stringify(events)}`);
        return events;
    }
}

function get_downstairs_bathroom_scene(mirror_light_1: string, mirror_light_2: string, shower_light: string): RandomMultiScene {
    const spookyScenes = [
        new DownstairsBathCreepyClownShowerScene([mirror_light_1, mirror_light_2], shower_light),
        new ElectricLady([mirror_light_1, mirror_light_2, shower_light]),
    ];
    return new RandomMultiScene(spookyScenes, []);
}

export const SCENES_2023: { [key: string]: Scene; } = {
    // Test and Utility scenes
    "list": new ListOnLightsScene(),
    "get_light": new GetLight(21), // Change this to get the state of different lights by ID
    // "test_ring": new TestRingScene(),
    "find_bulb": new FindBulb(["down_bath_1", "down_bath_2", "down_bath_3", "living_room_3", "living_room_4"]),
    "find_bulb_2": new FindBulb(["halloween_hallway_2", "halloween_hallway_3", "guest_bathroom_shower", "garage_2"]),
    "find_bulb_3": new FindBulb(["down_bath_1", "down_bath_2", "down_bath_3", "living_room_3", "living_room_4"]),
    // Scenes for the party
    "front_light_flicker": new FrontLightFlickerScene(["living_room_1", "living_room_2"]),
    "welcome_inside": new WelcomeInsideScene(["entry_2", "downstairs_1"]),
    "photobooth_thunder": new PhotoboothThunderScene(["living_room_1", "living_room_2"]),
    "creepy_clown_shower": new DownstairsBathCreepyClownShowerScene(["down_bath_1", "down_bath_2"], "down_bath_3"),
    "halloween_hallway": new HalloweenHallway("halloween_hallway_1", "halloween_hallway_2", "halloween_hallway_3", "halloween_hallway_4", "halloween_hallway_5"),
    "downstairs_bathroom": get_downstairs_bathroom_scene("down_bath_1", "down_bath_2", "down_bath_3"),
    "werewolf_door_jiggle": new WerewolfDoorJiggleScene("master_1"),
    "look_its_waffles": new LookItsWafflesScene(["living_room_3"]),
    "guest_bathroom": new GuestBathroomScene(["guest_bathroom_mirror_1", "guest_bathroom_mirror_2"], "guest_bathroom_shower"),
    "portal_to_hell": new PortalToHellScene("guest_bed_1", "guest_bed_2"),
    "dev_scene": new DownstairsBathCreepyClownShowerScene(["down_bath_1", "down_bath_2"], "down_bath_3"),
};