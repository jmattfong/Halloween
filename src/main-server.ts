
import "dotenv/config";
import { RingEnhancedSpookinatorV2 } from "./lib/ring";
import { SpookyHueApi } from "./lib/hue/hue";
import { parse } from "ts-command-line-args";
import { getLogger, setLogLevel } from "./lib/logging";
import { CategoryLogger, LogLevel } from "typescript-logging";
import { CONFIG } from "./lib/config";


const log: CategoryLogger = getLogger("main");

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IHalloweenServerArgs {
    startRingListener: boolean;
   startHueListener: boolean;
  debug: boolean;
  help?: boolean;
}

async function main() {
  const { env } = process;

  const args = parse<IHalloweenServerArgs>(
    {
      startRingListener: {
        type: Boolean,
        alias: "r",
        optional: true,
        description: `Whether to start the ring listener`,
      },
      startHueListener: {
        type: Boolean,
        alias: "b",
        optional: true,
        description: `Whether to start the hue listener`,
      },
      debug: {
        type: Boolean,
        alias: "d",
        optional: true,
        description: "Turn on debug logging",
      },
      help: {
        type: Boolean,
        optional: true,
        alias: "h",
        description: "Prints this usage guide",
      },
    },
    {
      helpArg: "help",
      headerContentSections: [
        {
          header: "Halloween Spooktacular Main Server",
          content: "Get ready to spook and be spooked. This is the main server that runs the show. All sensors are connected from this server, which sends all notifications to the connected clients",
        },
      ],
    }
  );

  const logLevel = args.debug ? LogLevel.Debug : LogLevel.Info;
  setLogLevel(logLevel);

  log.info(`input args: ${JSON.stringify(args)}\n`);


  if (args.startRingListener) {
    log.info("Setting up Ring");
    const ringSpook = new RingEnhancedSpookinatorV2(CONFIG.secretPath, true);
    log.debug(`all ring sensors: ${await ringSpook.getSensors()}`);
    log.info("Ring sensors set up");
  } else {
    log.info("skipping ring setup");
  }

  if (args.startHueListener) {
    log.info("Setting up connection to the Hue API");
    const spookHue: SpookyHueApi = new SpookyHueApi(CONFIG.secretPath, CONFIG);
    await spookHue.connectUsingIP(CONFIG.hue_bridge_ip);
    log.debug(`all hue sensors: ${await spookHue.getSensors()}`);
    log.info("Hue sensors set up");
  } else {
    log.info("skipping hue setup");
  }

}

main();
