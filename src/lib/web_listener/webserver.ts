import { Server, IncomingMessage, ServerResponse, createServer } from "http"
import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../logging";
const log: CategoryLogger = getLogger("webserver")

export class RegisterMessage {
    ip: string
    port: number
    sensors: string[]

    constructor(ip: string, port: number, sensors: string[]) {
        this.sensors = sensors;
    }
}

export enum SensorType {
    HUE = "hue",
    RING = "ring",
}

export class SensorUpdateMessage {
    sensorId: string
    sensorType: SensorType
    data: boolean

    constructor(sensorId: string, sensorType: SensorType, data: boolean) {
        this.sensorId = sensorId;
        this.sensorType = sensorType;
        this.data = data;
    }
}

// This class is used as the web server for the orchestrator executable. This web server registers clients
// and the sensors they want to get updates for. The orchestrator then sends updates to the clients when the
// sensor is triggered.
export class OrchestratorWebServer {
    private port: number
    private server: Server
    private registerCallback: (clientUri: URL, sensors: string[]) => void

    constructor(port: number, registerCallback: (clientUri: URL, sensors: string[]) => void) {
        this.port = port;
        this.registerCallback = registerCallback;

        let handler = async (req: IncomingMessage, res: ServerResponse) => {

            log.debug(`received ${req.method} @ ${req.url}`);

            if (req.method == "POST" && req.url == "/register") {
                let registerEvent: RegisterMessage;
                try {
                    registerEvent = await getJSONDataFromRequestStream<RegisterMessage>(req);
                } catch (e) {
                    log.info(`error processing the input: ${e}`);
                    res.statusCode = 400;
                    res.end("error with request");
                    return;
                }

                const clientUri = new URL(`http://${registerEvent.ip}:${registerEvent.port}`);
                log.info(`registering client ${clientUri}`);

                this.registerCallback(clientUri, registerEvent.sensors);
                res.statusCode = 200;
                res.end("OK");
                return
            }

        }

        this.server = createServer(handler);
    }

    public listen() {
        this.server.listen(this.port, () => {
            log.info(`Server listening on port ${this.port}`);
        });
    }

    public close() {
        this.server.close();
    }

}

function getJSONDataFromRequestStream<T>(request: IncomingMessage): Promise<T> {
    return new Promise((resolve, reject) => {
        let chunks: Array<Buffer> = [];
        request.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
        });
        request.on('end', () => {

            let json;
            try {
                json = JSON.parse(Buffer.concat(chunks).toString());
            } catch (e) {
                reject(e);
                return;
            }

            resolve(json);
        });
    })
}

// This class is used as the web server for the client executable. This web server listens for updates
// from the orchestrator
export class ClientWebServer {
    private port: number
    private server: Server
    private eventCallbackMap: Map<string, Array<(event: SensorUpdateMessage) => void>>

    constructor(port: number) {
        this.port = port;
        this.eventCallbackMap = new Map();

        let handler = async (req: IncomingMessage, res: ServerResponse) => {

            log.debug(`received ${req.method} @ ${req.url}`);

            if (req.method == "POST" && req.url == "/event") {
                let sensorUpdate: SensorUpdateMessage;
                try {
                    sensorUpdate = await getJSONDataFromRequestStream<SensorUpdateMessage>(req);
                } catch (e) {
                    log.info(`error processing the input: ${e}`);
                    res.statusCode = 400;
                    res.end("error with request");
                    return;
                }

                if (!sensorUpdate.sensorId) {
                    res.statusCode = 400;
                    res.end("error with request");
                    return;
                }

                let callbacks: Array<(sensorUpdate: SensorUpdateMessage) => void> | undefined = this.eventCallbackMap.get(sensorUpdate.sensorId);

                if (callbacks == undefined) {
                    log.info(`no callbacks for ${sensorUpdate.sensorId}`);
                    res.end(`no callbacks for ${sensorUpdate.sensorId}`);
                    return;
                }

                callbacks.forEach(callback => callback(sensorUpdate));

                log.debug(`received message: ${req.method} -> ${JSON.stringify(sensorUpdate)}`);
                res.statusCode = 200;
                res.end("OK");
            } else {
                res.statusCode = 404;
                res.end("not found");
            }
        }

        this.server = createServer(handler);
    }

    addCallback(name: string, callback: (event: SensorUpdateMessage) => void) {

        let callbacksForName = this.eventCallbackMap.get(name);

        if (!callbacksForName) {
            callbacksForName = [callback];
        } else {
            callbacksForName.push(callback);
        }

        this.eventCallbackMap.set(name, callbacksForName);
    }

    public listen() {
        this.server.listen(this.port, () => {
            log.info(`Server listening on port ${this.port}`);
        });
    }

    public close() {
        this.server.close();
    }

}