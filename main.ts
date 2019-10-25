import 'dotenv/config'
import { RingApi, RingDeviceType, RingDeviceData } from 'ring-client-api'
import { readFileSync } from 'fs';
import { RingEnhancedSpookinatorV2 } from './lib/ring';
import { Chromecaster } from './lib/chromecast';
import { SpookyCli } from './lib/cli';
import { ALL_VIDEOS } from './lib/videos';
import { FlickerPattern, OffPattern, StableColourPattern, SleepPattern } from './lib/hue/patterns';
import { red, white } from './lib/hue/colour';
import { SpookyHueBulbPlayer } from './lib/hue/spooky_bulb_player';
import { SpookyHueApi } from './lib/hue/hue';

const configContents = readFileSync('./config/config.json', {encoding: 'utf-8'})
let config = JSON.parse(configContents);

async function main() {
    const { env } = process

    // const chromecaster = new Chromecaster()
    // chromecaster.start();

    var ringConfigPath = config.secretPath;
    const spook = new RingEnhancedSpookinatorV2(ringConfigPath, true);

    const spookhue = new SpookyHueApi(ringConfigPath);
    await spookhue.connect();
    const spookyHueBulbPlayer = new SpookyHueBulbPlayer(spookhue);

    const sensors = await spook.getSensors();

    const cli = new SpookyCli(ALL_VIDEOS, (video) => {
        // chromecaster.playVideo(video);
    });

    const spookyLightMap = {
        "Half Bathroom": {
            lights: [{
                id: 1,
                patterns: [
                    new StableColourPattern(white, 40, 5, 0),
                    new FlickerPattern(4.5),
                    new OffPattern(1),
                    new StableColourPattern(red, 60, 12, 0),
                    new StableColourPattern(white, 60, 10, 10)
                ]
            }]
        }
    }

    const defaultsMap = {
        "Half Bathroom": {
            lights: [{
                id: 1,
                patterns: [
                    new StableColourPattern(white, 40, 10, 10),
                    new OffPattern(1)
                ]
            }]
        }
    }

    sensors.forEach(s => {
        if (s.name === 'Front Gate') {
            spook.addSensorCallback(s, (data: RingDeviceData) => {
                console.log(`callback called on ${data.name}`);
                if (data.faulted) {
                    // chromecaster.playRandomVideo();
                }
            });
        }

        if (spookyLightMap.hasOwnProperty(s.name)) {
            spook.addSensorCallback(s, (data: RingDeviceData) => {
                console.log(`callback called on ${data.name}`);
                if (!data.faulted) {
                    spookyLightMap[s.name].lights.forEach(light => {
                        spookyHueBulbPlayer.playPattern(light.id, light.patterns);
                    });
                } else {
                    // this occurs when the door is opened
                    defaultsMap[s.name].lights.forEach(light => {
                        spookyHueBulbPlayer.playPattern(light.id, light.patterns);
                    });
                }
            });
        }
    });

    // cli.start();
}

main();