import { RegisterEvent, SensorType, SensorUpdateEvent } from "./webserver";
import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../logging";
const log: CategoryLogger = getLogger("requests");

export async function sendRegisterEvent(
  orchestratorIp: string,
  orchestratorPort: number,
  clientIp: string,
  clientPort: number,
  sensors: string[],
) {
  const event: RegisterEvent = new RegisterEvent(clientIp, clientPort, sensors);
  sendRequest(
    `http://${orchestratorIp}:${orchestratorPort}`,
    `register`,
    event,
  );
}

export async function sendSensorEvent(
  clientUri: string,
  sensorId: string,
  sensorType: SensorType,
  data: boolean,
) {
  const event: SensorUpdateEvent = new SensorUpdateEvent(
    sensorId,
    sensorType,
    data,
  );
  sendRequest(clientUri, `event`, event);
}

async function sendRequest<T>(endpoint: string, path: string, request: T) {
  const fullPath = endpoint.endsWith("/")
    ? `${endpoint}${path}`
    : `${endpoint}/${path}`;
  log.info(`sending request to ${fullPath}`);
  const requestObject = JSON.stringify(request);
  log.debug(`sending request: ${requestObject}`);
  try {
    const response = await fetch(`${fullPath}`, {
      method: "POST",
      body: requestObject,
      headers: {
        "Content-Type": "application/json",
      },
    });

    log.debug(`result of sending request to @${fullPath}`);
    if (response.ok) {
      log.info("request was successful");
    } else {
      log.warn(`error sending request to client @${fullPath}`);
    }
  } catch (e) {
    log.warn(`error sending request to client @${fullPath}: ${e}`);
  }
}
