import { ServerResponse } from "http";
import { IncomingMessage } from "http";
import { createServer } from "http";
import { Server } from "http";
import { CategoryLogger } from "typescript-logging";
import { CONFIG } from "../config";
import { NewEvent } from "../events/Event";
import { eventBridge } from "../events/EventBridge";
import { getLogger } from "../logging";
import { Trigger } from "./Trigger";

const log: CategoryLogger = getLogger("webserver");

export class EventMessage {
  name: string;
  state: string;

  constructor(name: string, state: string) {
    this.name = name;
    this.state = state;
  }
}

export class WebServer {
  private port: number;
  private server: Server;

  constructor(port: number) {
    this.port = port;

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

        log.info(`received message: ${req.method} -> ${JSON.stringify(event)}`);

        eventBridge.post(
          new NewEvent(
            new RemoteTrigger({
              name: `[${event.name}-${event.state}]`,
            }),
            "received"
          )
        );

        res.statusCode = 200;
        res.end("OK");
      } else {
        res.statusCode = 404;
        res.end("not found");
      }
    };

    this.server = createServer(handler);
  }

  private getJSONDataFromRequestStream<T>(
    request: IncomingMessage
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let chunks: Array<Buffer> = [];
      request.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      request.on("end", () => {
        let json;
        try {
          json = JSON.parse(Buffer.concat(chunks).toString());
        } catch (e) {
          reject(e);
          return;
        }

        resolve(json);
      });
    });
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

const server = new WebServer(CONFIG.web_server_port);
server.listen();

export class RemoteTrigger extends Trigger {
  constructor({ name }: RemoteTrigger.Params) {
    super({
      name,
      type: "RemoteTrigger",
    });
  }
}

export namespace RemoteTrigger {
  export type Params = {
    name: string;
  };
}
