import { Server, IncomingMessage, ServerResponse, createServer } from "http"
import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../logging";
const log: CategoryLogger = getLogger("webserver")

export class EventMessage {
    name: string

    constructor(name: string) {
        this.name = name;
    }

}

export class WebServer {
    private port: number
    private server: Server
    private callback: (event: EventMessage) => void

    constructor(port: number, callback: (event: EventMessage) => void) {
        this.port = port;
        this.callback = callback;

        let handler = async (req: IncomingMessage, res: ServerResponse) => {

            log.debug(`received ${req.method} @ ${req.url}`);

            if (req.method == "POST" && req.url == "/event") {
                let result;
                try {
                    result = await this.getJSONDataFromRequestStream<EventMessage>(req);
                } catch (e) {
                    log.info(`error processing the input: ${e}`);
                    res.statusCode = 400;
                    res.end("error with request");
                    return;
                }

                this.callback(result);

                log.info(`received message: ${req.method} -> ${JSON.stringify(result)}`);
                res.statusCode = 200;
                res.end("OK");
            } else {
                res.statusCode = 404;
                res.end("not found");
            }
        }

        this.server = createServer(handler);
    }

    getJSONDataFromRequestStream<T>(request: IncomingMessage): Promise<T> {
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