import { SoundPattern, FlickerPattern, OffPattern, StableColourPattern, SleepPattern, OnPattern, Pattern, PulsePattern } from './patterns';
import { red, white, blueish_white } from '../hue/colour';

export class Event {

    public lightName: string
    public patterns: Pattern[]

    constructor(lightName: string, ...patterns: Pattern[]) {
        this.lightName = lightName
        this.patterns = patterns;
    }
}

class ElectricLadyMainEvent extends Event {
    constructor(lightName: string) {
        super(lightName,
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern('resources/sparks.mp3', new FlickerPattern(5.5), 3),
            new OffPattern(1),
            new OffPattern(12),
            new StableColourPattern(white, 60, 10, 10))
    }
}

class ElectricLadySubEvent extends Event {
    constructor(lightName: string) {
        super(lightName,
            new OffPattern(5),
            new OffPattern(5.5),
            new OffPattern(1),
            new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(red, 60, 12, 0), 500),
            new OffPattern(10))
    }
}

export function getElectricLadyEvent(subLightName: string, ...mainLightNames: string[]): Event[] {
    let result: Event[] = new Array(1 + mainLightNames.length)
    result[0] = new ElectricLadySubEvent(subLightName)
    let i = 1
    mainLightNames.forEach(name => {
        result[i++] = new ElectricLadyMainEvent(name)
    })
    return result
}

class ChillEvent extends Event {
    constructor(lightName: string) {
        super(lightName, new StableColourPattern(white, 40, 10, 10))
    }
}

class OffEvent extends Event {
    constructor(lightName: string) {
        super(lightName, new OffPattern(1))
    }
}

export function getChillEvents(subLightName: string, ...mainLightNames: string[]): Event[] {
    let result: Event[] = new Array(1 + mainLightNames.length)
    result[0] = new OffEvent(subLightName)
    let i = 1
    mainLightNames.forEach(name => {
        result[i++] = new ChillEvent(name)
    })
    return result
}