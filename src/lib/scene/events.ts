import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './patterns';

export class Event {

    public lightName: string
    public patterns: Pattern[]

    constructor(lightName: string, ...patterns: Pattern[]) {
        this.lightName = lightName
        this.patterns = patterns;
    }

    public cancel() {
        this.patterns.forEach((p) => p.cancel());
    }
}

function buildEventsForLights(pattern: Pattern[], mainLightNames: string[]): Event[] {
    let result: Event[] = new Array(mainLightNames.length)
    let i = 0
    mainLightNames.forEach(name => {
        result[i++] = new Event(name, ...pattern)
    })
    return result
}

function buildEventsWithSubroutine(subPattern: Pattern[], subLightName: string, pattern: Pattern[], mainLightNames: string[]): Event[] {
    let result: Event[] = new Array(1 + mainLightNames.length)
    result[0] = new Event(subLightName, ...subPattern)
    let i = 1
    mainLightNames.forEach(name => {
        result[i++] = new Event(name, ...pattern)
    })
    return result
}
