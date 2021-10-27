import { Pattern } from "./patterns";

export class Event {
    public patterns: Pattern[]

    constructor(...patterns: Pattern[]) {
        this.patterns = patterns;
    }
}