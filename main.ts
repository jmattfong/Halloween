import 'dotenv/config'
import { RingApi, RingDeviceType, RingDeviceData } from 'ring-client-api'
import { skip } from 'rxjs/operators'
import { RingEnhancedSpookinatorV2 } from './lib/ring';

// Look at example here: https://github.com/dgreif/ring/blob/master/examples/example.ts
// And commit here if you need to add new functionality around new devices or locations
// https://github.com/jmattfong/Halloween/commit/65141d02f19ba41dfc8684a98d7a683c3a4e0850
async function main() {
    const { env } = process

    var ringConfigPath = './secrets/secrets.json';
    const spook = new RingEnhancedSpookinatorV2(ringConfigPath, true)
    const sensors = await spook.getSensors()

    sensors.forEach(s => {
        const callback = (data: RingDeviceData) => {
            console.log(`it worked! found device data: ${data.name}`);
        };

        spook.addSensorCallback(s, callback);
    });
}

// All the above is a single function, when you run a typescript file
// it only executes functions that are called, in this case it calls main()
// which is the function we defined
main();