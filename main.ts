import 'dotenv/config'
import { RingApi, RingDeviceType, RingDeviceData } from 'ring-client-api'
import { skip } from 'rxjs/operators'
import { readFileSync } from 'fs';
import { RingEnhancedSpookinatorV2 } from './lib/ring';
import { Chromecaster } from './lib/chromecast';
import { SpookyCli } from './lib/cli';
import { ALL_VIDEOS } from './lib/videos';
import { SpookyHue, FlickerPattern, OffPattern, StableColourPattern, SleepPattern } from './lib/hue';
import { Colour } from './lib/colour';

const configContents = readFileSync('./config/config.json', {encoding: 'utf-8'})
let config = JSON.parse(configContents);

// Look at example here: https://github.com/dgreif/ring/blob/master/examples/example.ts
// And commit here if you need to add new functionality around new devices or locations
// https://github.com/jmattfong/Halloween/commit/65141d02f19ba41dfc8684a98d7a683c3a4e0850
async function main() {
    const { env } = process

    // const chromecaster = new Chromecaster()
    // chromecaster.start();

    var ringConfigPath = config.secretPath
    const spook = new RingEnhancedSpookinatorV2(ringConfigPath, true)
    const spookhue = new SpookyHue(ringConfigPath)
    await spookhue.connect()
    const sensors = await spook.getSensors()

    const cli = new SpookyCli(ALL_VIDEOS, (video) => {
        // chromecaster.playVideo(video);
    });

    const red = new Colour(.7, .3);
    const white = new Colour(.31, .32)

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
                        spookhue.playPattern(light.id, light.patterns);
                    });
                } else {
                    // this occurs when the door is opened
                    defaultsMap[s.name].lights.forEach(light => {
                        spookhue.playPattern(light.id, light.patterns);
                    });
                }
            });
        }
    });

    // cli.start();
}

// All the above is a single function, when you run a typescript file
// it only executes functions that are called, in this case it calls main()
// which is the function we defined
main();