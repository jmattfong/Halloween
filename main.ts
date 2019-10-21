import 'dotenv/config'
import { RingApi, RingDeviceType, RingDeviceData } from 'ring-client-api'
import { skip } from 'rxjs/operators'
import { readFileSync } from 'fs';
import { RingEnhancedSpookinatorV2 } from './lib/ring';
import { Chromecaster } from './lib/chromecast';

const configContents = readFileSync('./config/config.json', {encoding: 'utf-8'})
let config = JSON.parse(configContents);

// Look at example here: https://github.com/dgreif/ring/blob/master/examples/example.ts
// And commit here if you need to add new functionality around new devices or locations
// https://github.com/jmattfong/Halloween/commit/65141d02f19ba41dfc8684a98d7a683c3a4e0850
async function main() {
    const { env } = process

    // var ringConfigPath = config.secretPath
    // const spook = new RingEnhancedSpookinatorV2(ringConfigPath, true)
    // const sensors = await spook.getSensors()

    // sensors.forEach(s => {
    //     const callback = (data: RingDeviceData) => {
    //         console.log(`it worked! found device data: ${data.name}`);
    //         console.dir(data, {depth: null});
    //     };

    //     spook.addSensorCallback(s, callback);
    // });
    let deviceName = 'Chromecast-70c4c8babee87879b01e6d819b6b5e97';

    const chromecaster = new Chromecaster()
    chromecaster.start();

    setTimeout(() => {
        chromecaster.playRandomVideo()
    }, 15000);
}

// All the above is a single function, when you run a typescript file
// it only executes functions that are called, in this case it calls main()
// which is the function we defined
main();