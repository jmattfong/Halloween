import 'dotenv/config'
import { readFileSync } from 'fs';
import { RingEnhancedSpookinatorV2 } from './lib/ring';
import { SpookyHueApi } from './lib/hue/hue';
import { parse } from 'ts-command-line-args';
import { getLogger } from './lib/logging'
import { CategoryLogger } from 'typescript-logging';
import { SCENES } from './lib/scene';

const log: CategoryLogger = getLogger("main")

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IHalloweenServerArgs {
    scene: string[];
    help?: boolean;
}

async function main() {
    const { env } = process

    const args = parse<IHalloweenServerArgs>(
        {
            scene: { type: String, alias: 's', multiple: true, description: `The scene to run. Choose from: ${Object.keys(SCENES)}`},
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

    var ringSpook: RingEnhancedSpookinatorV2
    const getRing = async () => {
        if (ringSpook == null) {
            log.info('Setting up Ring')
            ringSpook = new RingEnhancedSpookinatorV2(config.secretPath, true)
            log.info(`all my sensors: ${await ringSpook.getSensors()}`);
        }
        return ringSpook
    }

    var spookHue: SpookyHueApi
    const getHue = async () => {
        if (spookHue == null) {
            log.info('Setting up Hue')
            spookHue = new SpookyHueApi(config.secretPath)
            await spookHue.connect();
            log.info(`get all lights: ${await spookHue.getLights()}`);
        }
        return spookHue
    }

    args.scene.forEach(s => {
        SCENES[s].start(getRing, getHue)
    })

}

main();
