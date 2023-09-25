import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
const log: CategoryLogger = getLogger("events");
import { Pattern } from './patterns';

export class Event {

    public lightName: string;
    public patterns: Pattern[];

    constructor(lightName: string, ...patterns: Pattern[]) {
        this.lightName = lightName;
        this.patterns = patterns;
    }

    public cancel() {
        log.info(`going to cancel all patterns in the event ${this.lightName}`);
        this.patterns.forEach((p) => p.cancel());
    }
}
