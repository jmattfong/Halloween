import { HueSensorUpdate, HueSensor } from './lib/hue/sensor';
import "dotenv/config";
import { RingEnhancedSpookinatorV2 } from "./lib/ring";
import { SpookyHueApi } from "./lib/hue/hue";
import { parse } from "ts-command-line-args";
import { getLogger, setLogLevel } from "./lib/logging";
import { CategoryLogger, LogLevel } from "typescript-logging";
import { CONFIG } from "./lib/config";
import { SensorType, OrchestratorWebServer, TriggerScope } from "./lib/web_listener/webserver";
import { RingDeviceData, RingDevice } from "ring-client-api";
import { sendSensorEvent } from './lib/web_listener/requests';


const log: CategoryLogger = getLogger("main");

// For details about adding new args, see https://www.npmjs.com/package/ts-command-line-args
interface IHalloweenServerArgs {
  startRingListener: boolean;
  startHueListener: boolean;
  port: number;
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
      port: {
        type: Number,
        alias: "p",
        optional: true,
        defaultValue: 8000,
        description: `The port to listen for requests on`,
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

  // We store the client's ip address and the sensor it is looking for in a map where
  // the key is the sensor id, and the value is a list of clients that are listening to
  // that sensor
  let registeredClients = new Map<string, string[]>();
  let allClients = new Set<string>();

  const server = new OrchestratorWebServer(args.port,
    (clientUri: URL, sensors: string[]) => {
      log.info(`registering client ${clientUri} for sensor(s) ${sensors}`)
      sensors.forEach((sensorId) => {
        let clients = registeredClients.get(sensorId);
        if (clients == null) {
          clients = [];
          registeredClients.set(sensorId, clients);
        }
        allClients.add(clientUri.toString());
        clients.push(clientUri.toString());
      });
    },
    (name: string, scope: TriggerScope, clientEndpoint?: string) => {

      log.info(`triggering ${name} with scope ${scope} (endpoint? ${clientEndpoint})`);

      if (scope == TriggerScope.GLOBAL) {
        log.info(`sending trigger to all clients`);
        allClients.forEach((clientUri: string) => {
          log.info(`sending trigger to client @${clientUri} `)
          try {
            sendSensorEvent(clientUri, name, SensorType.MANUAL, true);
          } catch (e) {
            log.warn(`error sending trigger to client @${clientUri}: ${e} `)
          }
        });
        return
      }

      if (scope == TriggerScope.DIRECT) {
        log.info(`sending trigger to client @${clientEndpoint} `)
        try {
          sendSensorEvent(clientEndpoint!, name, SensorType.MANUAL, true);
        } catch (e) {
          log.warn(`error sending trigger to client @${clientEndpoint}: ${e} `)
        }
        return
      }
    });

  if (args.startRingListener) {
    log.info("Setting up Ring");
    const ringSpook = new RingEnhancedSpookinatorV2(CONFIG.secretPath, true);
    log.debug(`all ring sensors: ${await ringSpook.getSensors()} `);

    setupRingListener(registeredClients, ringSpook);

    log.info("Ring sensors set up");
  } else {
    log.info("skipping ring setup");
  }

  if (args.startHueListener) {
    log.info("Setting up connection to the Hue API");
    const spookHue: SpookyHueApi = new SpookyHueApi(CONFIG.secretPath, CONFIG);
    await spookHue.connectUsingIP(CONFIG.hue_bridge_ip);
    log.debug(`all hue sensors: ${await spookHue.getSensors()} `);

    setupHueListeners(registeredClients, spookHue);

    log.info("Hue sensors set up");
  } else {
    log.info("skipping hue setup");
  }

  await server.listen();

}

// Sets up the ring listeners and callbacks for the ring sensors
async function setupRingListener(registeredClients: Map<string, string[]>, ringSpook: RingEnhancedSpookinatorV2) {
  const ringSensors: RingDevice[] = await ringSpook.getSensors();

  const ringCallback = (data: RingDeviceData) => {
    const sensorId = data.name;
    log.info(`ring callback called on ${sensorId} `);
    registeredClients.get(sensorId)?.forEach(async (clientUri: string) => {
      log.info(`sending ring callback to client @${clientUri} `)
      try {
        sendSensorEvent(clientUri, sensorId, SensorType.RING, data.faulted);
      } catch (e) {
        log.warn(`error sending ring callback to client @${clientUri}: ${e} `)
      }
    })
  };

  ringSensors.forEach((ringSensor: RingDevice) => {
    ringSpook.addSensorCallback(ringSensor, ringCallback);
  });
}


// Sets up the hue sensors and callbacks for the hue sensors
async function setupHueListeners(registeredClients: Map<string, string[]>, spookHue: SpookyHueApi) {

  const hueSensors = await spookHue.getSensors();
  hueSensors.forEach((hueSensor: HueSensor) => {
    const hueCallback = (update: HueSensorUpdate) => {
      const sensorId = hueSensor.getId();
      log.info(`hue callback called on ${sensorId} `);
      registeredClients.get(`${sensorId} `)?.forEach(async (clientUri: string) => {
        log.info(`sending hue callback to client @${clientUri} `)
        try {
          sendSensorEvent(clientUri, `${sensorId} `, SensorType.HUE, update.getPresence());
        } catch (e) {
          log.warn(`error sending hue callback to client @${clientUri}: ${e} `)
        }
      })
    };

    hueSensor.addCallback(hueCallback);
    hueSensor.start();
  });

}

main();
