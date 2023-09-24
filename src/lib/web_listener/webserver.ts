import { Server, IncomingMessage, ServerResponse, createServer } from "http"
import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../logging";
const log: CategoryLogger = getLogger("webserver")

export class EventMessage {
    name: string
    data: number

    constructor(name: string, data: number) {
        this.name = name;
        this.data = data;
    }
}

export class WebServer {
    private port: number
    private server: Server
    private eventCallbackMap: Map<string, Array<(event: EventMessage) => void>>

    constructor(port: number) {
        this.port = port;
        this.eventCallbackMap = new Map();

        let handler = async (req: IncomingMessage, res: ServerResponse) => {

            log.debug(`received ${req.method} @ ${req.url}`);

            if (req.method == "POST" && req.url == "/event") {
                let event: EventMessage;
                try {
                    event = await this.getJSONDataFromRequestStream<EventMessage>(req);
                } catch (e) {
                    log.info(`error processing the input: ${e}`);
                    res.statusCode = 400;
                    res.end("error with request");
                    return;
                }

                if (!event.name) {
                    res.statusCode = 400;
                    res.end("error with request");
                    return;
                }

                let callbacks: Array<(event: EventMessage) => void> | undefined = this.eventCallbackMap.get(event.name);

                if (callbacks == undefined) {
                    log.info(`no callbacks for ${event.name}`);
                    res.end(`no callbacks for ${event.name}`);
                    return;
                }

                callbacks.forEach(callback => callback(event));

                log.info(`received message: ${req.method} -> ${JSON.stringify(event)}`);
                res.statusCode = 200;
                res.end("OK");
            } else {
                res.statusCode = 404;
                res.end("not found");
            }
        }

        this.server = createServer(handler);
    }

    addCallback(name: string, callback: (event: EventMessage) => void) {

        let callbacksForName = this.eventCallbackMap.get(name);

        if (!callbacksForName) {
            callbacksForName = [callback];
        } else {
            callbacksForName.push(callback);
        }

        this.eventCallbackMap.set(name, callbacksForName);
    }


    private getJSONDataFromRequestStream<T>(request: IncomingMessage): Promise<T> {
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

    public listen() {
        this.server.listen(this.port, () => {
            log.info(`Server listening on port ${this.port}`);
        });
    }

    public close() {
        this.server.close();
    }

}