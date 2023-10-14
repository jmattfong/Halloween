import { Server, IncomingMessage, ServerResponse, createServer } from "http"
import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../logging";
const log: CategoryLogger = getLogger("webserver")

export class RegisterEvent {
    ip: string
    port: number
    sensors: string[]

    constructor(ip: string, port: number, sensors: string[]) {
        this.ip = ip;
        this.port = port;
        this.sensors = sensors;
    }
}

export enum TriggerScope {
    GLOBAL = "global",
    DIRECT = "direct",
}

export class TriggerEvent {
    name: string
    scope: TriggerScope
    clientEndpoint?: string

    constructor(name: string, scope: TriggerScope, clientEndpoint?: string) {
        this.name = name;
        this.scope = scope;
        this.clientEndpoint = clientEndpoint;
    }
}


export enum SensorType {
    HUE = "hue",
    RING = "ring",
    MANUAL = "manual",
}

export class SensorUpdateEvent {
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
    private triggerCallback: (name: string, scope: TriggerScope, clientEndpoint?: string) => void

    constructor(port: number, registerCallback: (clientUri: URL, sensors: string[]) => void, triggerCallback: (name: string, scope: TriggerScope, clientEndpoint?: string) => void) {
        this.port = port;
        this.registerCallback = registerCallback;
        this.triggerCallback = triggerCallback;

        let handler = async (req: IncomingMessage, res: ServerResponse) => {

            log.debug(`received ${req.method} @ ${req.url}`);

            if (req.method == "POST" && req.url == "/register") {
                let registerEvent: RegisterEvent;
                try {
                    registerEvent = await getJSONDataFromRequestStream<RegisterEvent>(req);
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

            if (req.method == "POST" && req.url == "/trigger") {
                let triggerEvent: TriggerEvent;
                try {
                    triggerEvent = await getJSONDataFromRequestStream<TriggerEvent>(req);
                } catch (e) {
                    log.info(`error processing the input: ${e}`);
                    res.statusCode = 400;
                    res.end("error with request");
                    return;
                }

                this.triggerCallback(triggerEvent.name, triggerEvent.scope, triggerEvent.clientEndpoint);

                res.statusCode = 200;
                res.end("OK");
                return
            }

            res.statusCode = 404;
            res.end("path not found");
            return;
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
    private eventCallback: (sensorId: string, sensorType: SensorType, data: boolean) => void

    constructor(port: number, eventCallback: (sensorId: string, sensorType: SensorType, data: boolean) => void) {
        this.port = port;
        this.eventCallback = eventCallback;

        let handler = async (req: IncomingMessage, res: ServerResponse) => {

            log.debug(`received ${req.method} @ ${req.url}`);

            if (req.method == "POST" && req.url == "/event") {
                let sensorUpdate: SensorUpdateEvent;
                try {
                    sensorUpdate = await getJSONDataFromRequestStream<SensorUpdateEvent>(req);
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

                this.eventCallback(sensorUpdate.sensorId, sensorUpdate.sensorType, sensorUpdate.data);

                log.debug(`received message: ${req.method} -> ${JSON.stringify(sensorUpdate)}`);
                res.statusCode = 200;
                res.end("OK");
                return;
            }

            res.statusCode = 404;
            res.end("not found");
            return;
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

export function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];

        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }
    return '0.0.0.0';
}