import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../logging";

const log: CategoryLogger = getLogger("event");

export class NewEvent {
  readonly source: Event.Source;
  readonly name: string;

  constructor(source: Event.Source, name: string) {
    this.source = source;
    this.name = name;
  }

  fullName(): string {
    return `${this.source.fullName()}-${this.name}`;
  }
}

export namespace Event {
  export abstract class Source {
    readonly type: string;
    readonly platform: string;
    readonly name: string;

    constructor(type: string, platform: string, name: string) {
      this.type = type;
      this.platform = platform;
      this.name = name;
    }

    fullName(): string {
      return `${this.type}-${this.platform}-${this.name}`;
    }
  }
}
