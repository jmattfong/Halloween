import "dotenv/config";
import { RingEnhancedSpookinatorV2 } from "./lib/ring";
import { SpookyHueApi } from "./lib/hue/hue";
import { WebServer } from "./lib/web_listener/webserver";
import { parse } from "ts-command-line-args";
import { getLogger, setLogLevel } from "./lib/logging";
import { CategoryLogger, LogLevel } from "typescript-logging";
import { SCENES_2022 } from "./lib/scene/scenes_2022";
import RingSensor from "./lib/triggers/sensors/RingSensor";
import { scenes2022 } from "./collections/2022";
import { InputTrigger } from "./lib/triggers/InputTrigger";
import { util_scenes } from "./collections/util";
import { CONFIG } from "./lib/config";
import { HueSensor } from "./lib/triggers/sensors/HueSensor";

const log: CategoryLogger = getLogger("main");
const SCENES = SCENES_2022;

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IHalloweenServerArgs {
  scene: string[];
  webserverPort: number;
  debug: boolean;
  help?: boolean;
}

async function main() {
  const { env } = process;

  const args = parse<IHalloweenServerArgs>(
    {
      scene: {
        type: String,
        alias: "s",
        multiple: true,
        optional: true,
        description: `The scene to run. Choose from: ${Object.keys(SCENES)}`,
      },
      webserverPort: {
        type: Number,
        defaultValue: 4343,
        alias: "p",
        optional: true,
        description: `The port to run the webserver on. Defaults to (4343)`,
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
          header: "Halloween Spooktacular",
          content: "Get ready to spook and be spooked",
        },
      ],
    }
  );

  const logLevel = args.debug ? LogLevel.Debug : LogLevel.Info;
  setLogLevel(logLevel);

  log.info(`input args: ${JSON.stringify(args)}\n`);

  const server = new WebServer(args.webserverPort);
  server.listen();

  var ringSpook: RingEnhancedSpookinatorV2;
  const getRing = async () => {
    if (ringSpook == null) {
      log.info("Setting up Ring");
      ringSpook = new RingEnhancedSpookinatorV2(CONFIG.secretPath, true);
      log.debug(`all my sensors: ${await ringSpook.getSensors()}`);
    }
    return ringSpook;
  };

  var spookHue: SpookyHueApi;
  const getHue = async () => {
    if (spookHue == null) {
      log.info("Setting up Hue");
      spookHue = new SpookyHueApi(CONFIG.secretPath, CONFIG);
      await spookHue.connectUsingIP(CONFIG.hue_bridge_ip);
      log.debug(
        `get all lights: ${(await spookHue.getLights()).map((l: any) =>
          l.toStringDetailed()
        )}`
      );
    }
    return spookHue;
  };

  args.scene.forEach((s) => {
    SCENES[s].start(getRing, getHue, server);
  });
}

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IAltHalloweenServerArgs {
  scene?: string[];
  debug: boolean;
  help?: boolean;
}

const ringDevices: RingSensor[] = [];
const hueDevices: HueSensor[] = [];

export const hueApi = new SpookyHueApi(CONFIG.secretPath, CONFIG);
export const ringApi = new RingEnhancedSpookinatorV2(CONFIG.secretPath, true);

async function altMain() {
  const args = parse<IAltHalloweenServerArgs>(
    {
      scene: {
        type: String,
        optional: true,
        alias: "s",
        multiple: true,
        description: `The scene to run. Choose from: ${Object.keys(SCENES)}`,
      },
      debug: {
        type: Boolean,
        optional: true,
        alias: "d",
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
          header: "Halloween Spooktacular",
          content: "Get ready to spook and be spooked",
        },
      ],
    }
  );

  const logLevel = args.debug ? LogLevel.Debug : LogLevel.Info;
  setLogLevel(logLevel);
  (await ringApi.getSensors()).forEach((device) => {
    ringDevices.push(new RingSensor(device));
  });

  await hueApi.connectUsingIP(CONFIG.hue_bridge_ip);
  log.debug(
    `get all lights: ${(await hueApi.getLights()).map((l: any) =>
      l.toStringDetailed()
    )}`
  );
  (await hueApi.getSensors()).forEach((device) => {
    hueDevices.push(new HueSensor(device));
  });

  InputTrigger;
  scenes2022;
  util_scenes;
}

main();
