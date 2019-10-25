import 'dotenv/config'
import { RingDeviceData } from 'ring-client-api'
import { readFileSync } from 'fs';
import { RingEnhancedSpookinatorV2 } from './lib/ring';
import { Chromecaster } from './lib/chromecast';
import { SpookyCli } from './lib/cli';
import { ALL_VIDEOS } from './lib/videos';
import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern } from './lib/hue/patterns';
import { red, white } from './lib/hue/colour';
import { SpookyHueBulbPlayer } from './lib/hue/spooky_bulb_player';
import { SpookyHueApi } from './lib/hue/hue';
import { HueSensorUpdate } from './lib/hue/sensor';

const configContents = readFileSync('./config/config.json', {encoding: 'utf-8'});
let config = JSON.parse(configContents);

const spookyLightPatterns = {
    "Half Bathroom": {
        lights: [{
            id: 1,
            spookyPatterns: [
                new StableColourPattern(white, 40, 5, 0),
                new SoundPattern('resources/espark.mp3', new FlickerPattern(4.5)),
                new OffPattern(1),
                new SoundPattern('resources/nmh_scream1.mp3', new StableColourPattern(red, 60, 12, 0)),
                new StableColourPattern(white, 60, 10, 10)
            ],
            unSpookyPatterns: [
                new StableColourPattern(white, 40, 10, 10),
                new StableColourPattern(white, 10, 10, 30)
            ]
        }]
    }
}

const repeatingRedPulsingPattern = [
    new StableColourPattern(red, 60, 1, 1),
    new OffPattern(1, 1)
]

async function main() {
    const { env } = process

    const chromecaster = await setupChromecaster();

    var ringConfigPath = config.secretPath;
    const spook = new RingEnhancedSpookinatorV2(ringConfigPath, true);

    const spookhue = new SpookyHueApi(ringConfigPath);
    await spookhue.connect();
    const spookyHueBulbPlayer = new SpookyHueBulbPlayer(spookhue);

    // Setup infinitely repeating light patterns
    spookyHueBulbPlayer.playRepeatingPattern(7, repeatingRedPulsingPattern);

    const sensors = await spook.getSensors();

    const cli = new SpookyCli(ALL_VIDEOS, (video) => {
        chromecaster.playVideo(video);
    });
    cli.start();

    sensors.forEach(s => {
        if (s.name === 'Front Gate') {
            spook.addSensorCallback(s, (data: RingDeviceData) => {
                console.log(`callback called on ${data.name}`);
                if (data.faulted) {
                    chromecaster.playRandomVideo();
                }
            });
        }

        if (spookyLightPatterns.hasOwnProperty(s.name)) {
            spook.addSensorCallback(s, (data: RingDeviceData) => {
                console.log(`callback called on ${data.name}`);
                const questionablySpookyKey = data.faulted ? "unSpookyPatterns" : "spookyPatterns";
                spookyLightPatterns[s.name].lights.forEach(light => {
                    spookyHueBulbPlayer.playPattern(light.id, light[questionablySpookyKey]);
                });
            });
        }
    });

    const hueSensor = await spookhue.getSensor(2);
    console.log(`found hue sensor: ${hueSensor.toString()}`)
    const callback = (update: HueSensorUpdate) => {
        console.log(`received status update: ${update}`);
        if (update.getPresence()) {
            chromecaster.playRandomVideo();
        }
    };
    hueSensor.addCallback(callback);
    hueSensor.start();
}

async function setupChromecaster() {
    const chromecaster = new Chromecaster()
    await chromecaster.start();
    return chromecaster;
}

main();
