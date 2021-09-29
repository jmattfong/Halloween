import 'dotenv/config'
import { RingDeviceData } from 'ring-client-api'
import { readFileSync } from 'fs';
import { RingEnhancedSpookinatorV2 } from './lib/ring';
import { Chromecaster } from './lib/chromecast';
import { SpookyCli } from './lib/cli';
import { ALL_VIDEOS } from './lib/videos';
import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern } from './lib/hue/patterns';
import { red, white } from './lib/hue/colour';
import { SpookyHueBulbPlayer } from './lib/hue/spooky_bulb_player';
import { SpookyHueApi } from './lib/hue/hue';
import { HueSensorUpdate } from './lib/hue/sensor';
import { parse } from 'ts-command-line-args';
import { getLogger } from './lib/logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("main")

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IHalloweenServerArgs {
    scene: string;
    help?: boolean;
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

// Keys in this dictionary are used as the scene name, but must also match the name of the sensor
const spookyLightPatterns: { [key: string]: Light[] } = {
    "Half Bathroom": [
        new Light(1, [
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern('resources/sparks.mp3', new FlickerPattern(5.5), 3),
            new OffPattern(1),
            new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(red, 60, 12, 0), 500),
            new StableColourPattern(white, 60, 10, 10)
        ], [
            new StableColourPattern(white, 40, 10, 10),
            new StableColourPattern(white, 10, 10, 30)
        ])],
    "": [
        new Light(7, [
            new StableColourPattern(red, 60, 1, 3),
            new StableColourPattern(red, 0, 1, 3)
        ],
            [])
    ]
}

const repeatingRedPulsingPattern = [
    new StableColourPattern(red, 60, 1, 2),
    new StableColourPattern(red, 0, 1, 3)
]

async function main() {
    const { env } = process

    const args = parse<IHalloweenServerArgs>(
        {
            scene: { type: String, alias: 's', description: `The scene to run. Choose from: ${Object.keys(spookyLightPatterns)}`},
            help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
        },
        {
            helpArg: 'help',
            headerContentSections: [{ header: 'Halloween Spooktacular', content: 'Get ready to spook and be spooked' }]
        },
    );

    log.info(`Args: ${JSON.stringify(args)}\n`)

    const configContents = readFileSync('./config/config.json', { encoding: 'utf-8' });
    let config = JSON.parse(configContents);

    const chromecaster = await setupChromecaster();
    log.info('starting server')

    var ringConfigPath = config.secretPath;
    const spook = new RingEnhancedSpookinatorV2(ringConfigPath, true);

    const spookhue = new SpookyHueApi(ringConfigPath);
    await spookhue.connect();
    const spookyHueBulbPlayer = new SpookyHueBulbPlayer(spookhue);

    // Setup infinitely repeating light patterns
    spookyHueBulbPlayer.playRepeatingPattern(6, repeatingRedPulsingPattern);
    spookyHueBulbPlayer.playRepeatingPattern(7, repeatingRedPulsingPattern);

    const sensors = await spook.getSensors();

    let lights = await spookhue.getLights()
    log.info(`all my sensors: ${sensors}`);
    log.info(`get all lights: ${lights}`);

    const cli = new SpookyCli(ALL_VIDEOS, (video) => {
        chromecaster.playVideo(video);
    });
    cli.start();

    sensors.forEach(s => {
        if (s.name === 'Front Gate') {
            spook.addSensorCallback(s, (data: RingDeviceData) => {
                log.info(`callback called on ${data.name}`);
                if (data.faulted) {
                    chromecaster.playRandomVideo();
                }
            });
        }

        if (spookyLightPatterns.hasOwnProperty(s.name)) {
            spook.addSensorCallback(s, (data: RingDeviceData) => {
                log.info(`callback called on ${data.name}`);
                log.info(`${spookyLightPatterns}`)
                let lights: Light[] = spookyLightPatterns[s.name];

                lights.forEach(light => {
                    let patternWorkflow = data.faulted ? light.getUnspookyPatterns() : light.getSpookyPatterns()
                    spookyHueBulbPlayer.playPattern(light.getId(), patternWorkflow);
                });
            });
        }
    });

    const hueWalkwaySensor = await spookhue.getSensor(2);
    log.info(`found hue sensor: ${hueWalkwaySensor.toString()}`)
    const callback = (update: HueSensorUpdate) => {
        log.info(`received status update: ${update}`);
        if (update.getPresence()) {
            chromecaster.playRandomVideo();
        }
    };
    hueWalkwaySensor.addCallback(callback);
    hueWalkwaySensor.start();

    const hallwayPattern = [
        new FlickerPattern(30),
    ];

    const hallwaySensor = await spookhue.getSensor(1);
    const c = (update: HueSensorUpdate) => {
        if (update.getPresence()) {
            spookyHueBulbPlayer.playPattern(4, hallwayPattern);
        }
    }
    hallwaySensor.addCallback(c);
    hallwaySensor.start();
}

async function setupChromecaster() {
    const chromecaster = new Chromecaster()
    await chromecaster.start();
    return chromecaster;
}

async function pulseAllLights(spookhue: SpookyHueApi, spookyHueBulbPlayer: SpookyHueBulbPlayer) {
    const allLights = await spookhue.getLights();
    const pattern = [new OnPattern(100, 1, 1),
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

main();
