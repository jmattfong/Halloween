import { SpookyHueApi } from "./lib/hue/hue";
import {
  ClientWebServer,
  SensorType,
  getIPAddress,
} from "./lib/web_listener/webserver";
import { parse } from "ts-command-line-args";
import { getLogger, setLogLevel } from "./lib/logging";
import { CategoryLogger, LogLevel } from "typescript-logging";
import { CONFIG } from "./lib/config";

import { getScenes } from "./lib/scene/scenes_2025";
import { sendRegisterEvent } from "./lib/web_listener/requests";
import { SpookyHueBulbPlayer } from "./lib/hue/spooky_bulb_player";
import { SceneConfig, getSceneConfigFromFile } from "./lib/scene/scene_config";

const log: CategoryLogger = getLogger("main");

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IHalloweenServerArgs {
  scene: string[];
  name: string;
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
        description: `The scene to run. Choose from: ${Object.keys(getScenes(""))}`,
      },
      name: {
        type: String,
        alias: "n",
        optional: true,
        description: "The identifiable name of this client. Ex: 'dale'",
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
        defaultValue: "localhost",
        alias: "o",
        optional: true,
        description: `The ip where the orchestrator runs`,
      },
      orchestratorPort: {
        type: Number,
        defaultValue: 5400,
        alias: "x",
        optional: true,
        description: `The port where the orchestrator is listening for requests on. Default 5400`,
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
    },
  );

  const logLevel = args.debug ? LogLevel.Debug : LogLevel.Info;
  setLogLevel(logLevel);

  log.debug(`input args: ${JSON.stringify(args)}\n`);

  const scenes = getScenes(args.name);

  if (args.scene == null || args.scene.length == 0) {
    log.warn(
      `no scenes were specified. Please specify at least one scene to run. Choose from: ${Object.keys(scenes)}`,
    );
    return;
  }

  log.info(`Welcome to the Halloween Spooktacular. Client: ${args.name}`);

  const sceneConfig: SceneConfig = getSceneConfigFromFile(
    "./config/scene-config.json",
  );
  log.debug(`WHOLE CONFIG: ${JSON.stringify(sceneConfig)}`);

  const myScenes = sceneConfig.scenes.filter((s, index, array) => {
    return args.scene.includes(s.name);
  });

  const mySensors = myScenes.map((s) => s.sensorId);

  log.info(`scenes to run: ${myScenes.map((s) => s.name)}`);
  log.info(`sensor to register for: ${mySensors}`);

  // first we need to get our ip address
  const clientIp = getIPAddress();
  log.info(`client ip address is ${clientIp}`);

  // now we have our IP address, we need to register ourselves with the orchestrator to tell it
  // what sensors we want to listen for updates on
  sendRegisterEvent(
    args.orchestratorIp,
    args.orchestratorPort,
    clientIp,
    args.webserverPort,
    mySensors,
  );

  log.info(`starting up the spooky hue api`);
  const spookHue = new SpookyHueApi(CONFIG.secretPath, CONFIG);
  await spookHue.connectUsingIP(CONFIG.hueBridgeIp);
  log.debug(
    `get all lights: ${(await spookHue.getLights()).map((l: any) =>
      l.toStringDetailed(),
    )} `,
  );
  const spookyHueBulbPlayer = new SpookyHueBulbPlayer(spookHue);

  if (args.scene.indexOf("list") > -1) {
    scenes["list"].run(spookyHueBulbPlayer, null, null);
    return;
  }

  const server = new ClientWebServer(
    args.webserverPort,
    (sensorId: string, sensorType: SensorType, data: boolean) => {
      log.info(`callback called on ${sensorId} -> ${sensorType} [${data}]`);

      var scenesToTrigger: String[] = [];

      if (sensorType == SensorType.MANUAL) {
        log.info(`sensor is manual, using sensor id as scene name`);
        scenesToTrigger = [sensorId];
      } else {
        log.info(`sensor is not manual, looking for scene to run`);

        // we are now trying to find the scenes where the id match, the sensor match, and the current sensor
        // event matches whether we should trigger this event (e.g. should we trigger the scenes when the door is
        // open (faulted) or closed (not faulted))
        scenesToTrigger = myScenes
          .filter(
            (s) =>
              s.sensorId == sensorId &&
              sensorType == s.sensorType &&
              (s.onFault == null || s.onFault == data),
          )
          .map((s) => s.name);
      }

      log.debug(`${scenesToTrigger}`);

      if (scenesToTrigger.length == 0) {
        log.warn(
          `could not find scene to run for sensor ${sensorId} -> ${sensorType} `,
        );
        return;
      }

      scenesToTrigger.forEach((scene: string) => {
        if (!(scene in scenes)) {
          log.warn(
            `could not find scene "${scene}" to run for sensor ${sensorId} -> ${sensorType} `,
          );
          return;
        }

        log.info(`found scene to run ${scenesToTrigger} `);
        const sceneToRun = scenes[scene];

        const result = sceneToRun.run(spookyHueBulbPlayer, sensorType, data);
        result
          .then((value) => log.info(`Finished playing ${scene} => ${value}`))
          .catch((e) => {
            log.error(`Failed to play scene due to error`, e);
          });
      });
    },
  );

  server.listen();
}

main();
