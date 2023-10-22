import "dotenv/config";
import { SpookyHueApi } from "./lib/hue/hue";
import { ClientWebServer, SensorType, getIPAddress } from "./lib/web_listener/webserver";
import { parse } from "ts-command-line-args";
import { getLogger, setLogLevel } from "./lib/logging";
import { CategoryLogger, LogLevel } from "typescript-logging";
import { CONFIG } from "./lib/config";

import { SCENES_2023 } from "./lib/scene/scenes_2023";
import { sendRegisterEvent } from "./lib/web_listener/requests";
import { SpookyHueBulbPlayer } from "./lib/hue/spooky_bulb_player";
import { SceneConfig, getSceneConfigFromFile } from "./lib/scene/scene_config";
const SCENES = SCENES_2023;

const log: CategoryLogger = getLogger("main");

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IHalloweenServerArgs {
  scene: string[];
  webserverPort: number;
  orchestratorIp: string;
  orchestratorPort: number;
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
        defaultValue: 800,
        alias: "p",
        optional: true,
        description: `The port to run the webserver on. Defaults to (800)`,
      },
      orchestratorIp: {
        type: String,
        alias: "o",
        optional: true,
        description: `The ip where the orchestrator runs`,
      },
      orchestratorPort: {
        type: Number,
        defaultValue: 5400,
        alias: "x",
        optional: true,
        description: `The port where the orchestrator is listening for requests on`,
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

  log.debug(`input args: ${JSON.stringify(args)}\n`);

  if (args.scene == null || args.scene.length == 0) {
    log.warn(`no scenes were specified. Please specify at least one scene to run. Choose from: ${Object.keys(SCENES)}`);
    return;
  }

  const sceneConfig: SceneConfig = getSceneConfigFromFile('./config/scene-config.json');
  log.debug(`WHOLE CONFIG: ${JSON.stringify(sceneConfig)}`)

  const myScenes = sceneConfig.scenes.filter((s, index, array) => {
    return args.scene.includes(s.name);
  });

  const mySensors = myScenes.map(s => s.sensorId);

  log.info(`scenes to run: ${myScenes.map(s => s.name)}`)
  log.info(`sensor to register for: ${mySensors}`)

  // first we need to get our ip address
  const clientIp = getIPAddress();
  log.info(`client ip address is ${clientIp}`);

  // now we have our IP address, we need to register ourselves with the orchestrator to tell it
  // what sensors we want to listen for updates on
  sendRegisterEvent(args.orchestratorIp, args.orchestratorPort, clientIp, args.webserverPort, mySensors);

  log.info(`starting up the spooky hue api`);
  const spookHue = new SpookyHueApi(CONFIG.secretPath, CONFIG);
  await spookHue.connectUsingIP(CONFIG.hue_bridge_ip);
  log.debug(
    `get all lights: ${(await spookHue.getLights()).map((l: any) =>
      l.toStringDetailed()
    )} `
  );
  const spookyHueBulbPlayer = new SpookyHueBulbPlayer(spookHue);

  const server = new ClientWebServer(args.webserverPort,
    (sensorId: string, sensorType: SensorType, data: boolean) => {
      log.info(`callback called on ${sensorId} -> ${sensorType} `);

      var sceneName = null;

      if (sensorType == SensorType.MANUAL) {
        log.info(`sensor is manual, using sensor id as scene name`);
        sceneName = sensorId;
      } else {
        log.info(`sensor is not manual, looking for scene to run`);

        sceneName = myScenes.find((s) =>
          (s.sensorId == sensorId && sensorType == s.sensorType)
        )?.name;
      }

      if (sceneName == null) {
        log.warn(`could not find scene to run for sensor ${sensorId} -> ${sensorType} `);
        return
      }

      if (!(sceneName in SCENES)) {
        log.warn(`could not find scene to run for sensor ${sensorId} -> ${sensorType} `);
        return
      }

      log.info(`found scene to run ${sceneName} `)
      const sceneToRun = SCENES[sceneName];

      sceneToRun.run(spookyHueBulbPlayer, sensorType, data)
    });

  server.listen();
}

main();
