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

export function getChillEvents(subLightName: string, ...mainLightNames: string[]): Event[] {
    return buildEventsWithSubroutine(
        [
            new OffPattern(1)
        ], subLightName,
        [
            new StableColourPattern(white, 40, 10, 10)
        ], mainLightNames)
}

export function getElectricLadyEvent(subLightName: string, ...mainLightNames: string[]): Event[] {
    return buildEventsWithSubroutine(
        [
            new OffPattern(5),
            new OffPattern(5.5),
            new OffPattern(1),
            new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(red, 60, 12, 0), 0.5),
            new OffPattern(10)
        ], subLightName,
        [
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern('resources/sparks.mp3', new FlickerPattern(5.5), 0),
            new OffPattern(1),
            new OffPattern(12),
            new StableColourPattern(white, 60, 10, 10)
        ], mainLightNames)
}

/**
 * TODO not ready, copied from electric lady
 */
export function getAlienEvents(subLightName: string, ...mainLightNames: string[]): Event[] {
    return buildEventsWithSubroutine(
        [
            new OffPattern(5),
            new OffPattern(5.5),
            new OffPattern(1),
            new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(white, 60, 12, 0), 0.5),
            new OffPattern(10)
        ], subLightName,
        [
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern('resources/sparks.mp3', new FlickerPattern(5.5), 0),
            new OffPattern(1),
            new OffPattern(12), // TODO green?
            new StableColourPattern(red, 60, 10, 10)
        ], mainLightNames)
}

export function getPulsingRedEvent(...mainLightNames: string[]): Event[] {
    return buildEventsForLights(
        [
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3)
        ], mainLightNames)
}

/**
 * TODO needs testing
 */
export function getSpookyCockroachScene(...mainLightNames: string[]): Event[] {
    return buildEventsForLights(
        [
            new StableColourPattern(white, 5, 5, 0),
            new SoundPattern("resources/cockroach_walk.mp3", new StableColourPattern(white, 5, 2, 0), 1, 0.1),
            new SoundPattern("resources/cockroach_scurry_1.mp3", new StableColourPattern(blueish_white, 40, 1, 1), 0.01, 1),
            new SoundPattern("resources/cockroach_fight_1.mp3", new StableColourPattern(blueish_white, 50, 1, 1), 0.01, 0.5),
            new StableColourPattern(white, 60, 10, 10)
        ], mainLightNames)
}

/**
 * TODO needs testing
 */
export function getSpookyGhostScene(...mainLightNames: string[]): Event[] {
    return buildEventsForLights(
        [
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern("resources/ghost_movement.mp3", new StableColourPattern(white, 70, 8, 7), 1, 0.2),
            new SoundPattern("resources/ghost_cry.mp3", new FlickerPattern(1), 0.01, 0.75),
            new StableColourPattern(white, 60, 10, 10)
        ], mainLightNames)
}