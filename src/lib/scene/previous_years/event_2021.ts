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
            new OffPattern(4.5),
            new OffPattern(1),
            new SoundPattern('resources/woman_screaming.mp3', new StableColourPattern(red, 60, 12, 0), 0.7),
            new OffPattern(10)
        ], subLightName,
        [
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern('resources/sparks.mp3', new FlickerPattern(4.5), 0.01, .7),
            new OffPattern(1),
            new OffPattern(12),
            new StableColourPattern(white, 60, 10, 10)
        ], mainLightNames)
}


export function getAlienEvents(subLightName: string, ...mainLightNames: string[]): Event[] {
    return buildEventsWithSubroutine(
        [
            new OffPattern(5),
            new OffPattern(3),
            new OffPattern(5),
            new OffPattern(3),
            new OffPattern(7),
            new OffPattern(2),
            new OffPattern(5),
            new StableColourPattern(blue, 60, 5, 0),
            new StableColourPattern(blue, 60, 10, 0)
        ], subLightName,
        [
            new StableColourPattern(white, 60, 5, 0),
            new SoundPattern('resources/alien_snarl_creature.mp3', new StableColourPattern(blueish_white, 60, 2, 0), 1, 0.7),
            new StableColourPattern(blueish_white, 60, 5, 0),
            new SoundPattern('resources/scifi_alien.mp3', new StableColourPattern(blueish_white, 60, 2, 0), 1, 0.7),
            new StableColourPattern(blueish_white, 60, 7, 0),
            new SoundPattern('resources/alien_creature_2.mp3', new StableColourPattern(green, 60, 1, 0), 1, 0.7),
            new StableColourPattern(green, 60, 4, 0),
            new SoundPattern('resources/alien_creature.mp3', new StableColourPattern(green, 60, 4, 0), 1, 0.7),
            new StableColourPattern(green, 60, 10, 10)
        ], mainLightNames)
}

export function getChildRedEvent(subLightName: string, ...mainLightNames: string[]): Event[] {
    return buildEventsWithSubroutine(
        [
            new OffPattern(16),
            new SoundPattern('resources/creepy_child.mp3', new OffPattern(13), 0.7),
            new OffPattern(1),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2)
        ], subLightName,
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
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2),
            new StableColourPattern(red, 0, 3, 3),
            new StableColourPattern(red, 60, 2, 2)
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

export function getSpookyCockroachScene(...mainLightNames: string[]): Event[] {
    return buildEventsForLights(
        [
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern("resources/cockroach_walk.mp3", new StableColourPattern(white, 40, 2, 0), 0.01, 0.8),
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern("resources/cockroach_scurry_3.mp3", new StableColourPattern(blueish_white, 40, 1, 1), 0.01, 1),
            new StableColourPattern(blueish_white, 40, 3, 0),
            new SoundPattern("resources/cockroach_walk.mp3", new StableColourPattern(blueish_white, 50, 2, 1), 0.01, 0.8),
            new StableColourPattern(blueish_white, 60, 10, 10)
        ], mainLightNames)
}

export function getSpookyGhostScene(...mainLightNames: string[]): Event[] {
    return buildEventsForLights(
        [
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern("resources/ghost_movement.mp3", new StableColourPattern(white, 70, 8, 7), 1, 0.8),
            new SoundPattern("resources/ghost_cry.mp3", new FlickerPattern(1), 0.01, 0.9),
            new StableColourPattern(white, 60, 10, 10)
        ], mainLightNames)
}

export function getCandymanScene(subLightName: string, ...mainLightNames: string[]): Event[] {
    return buildEventsWithSubroutine(
        [
            new OffPattern(5),
            new OffPattern(20),
            new OffPattern(5),
            new StableColourPattern(red, 60, 10, 4)
        ], subLightName,
        [
            new StableColourPattern(white, 40, 5, 0),
            new SoundPattern("resources/candyman.mp3", new StableColourPattern(white, 70, 20, 7), 0.1, 0.8),
            new OffPattern(5),
            new OffPattern(10)
        ], mainLightNames)
}

export function getMichaelMyersScene(subLightName: string, ...mainLightNames: string[]): Event[] {
    return buildEventsWithSubroutine(
        [
            new OffPattern(5),
            new SoundPattern("resources/halloween_theme_trimmed.mp3", new OffPattern(76), 0.1, 0.5),
        ], subLightName,
        [
            new StableColourPattern(white, 60, 5, 0),
            new StableColourPattern(white, 60, 18, 0), // Starts 76 sec of song here
            new StableColourPattern(orange, 30, 12, 4),
            new StableColourPattern(orange, 50, 12, 4),
            new StableColourPattern(red, 30, 20, 4),
            new StableColourPattern(red, 70, 21, 4),
        ], mainLightNames)
}


export function getSawScene(...mainLightNames: string[]): Event[] {
    return buildEventsForLights(
        [
            new StableColourPattern(white, 60, 10, 0),
            new SoundPattern("resources/saw.mp3", new StableColourPattern(green, 70, 4, 4), 0.1, 0.8),
            new StableColourPattern(green, 70, 10, 4),
            new SoundPattern("resources/saw_laugh.mp3", new StableColourPattern(green, 70, 14, 4), 0.1, 0.8),
            new StableColourPattern(red, 30, 18, 0),
        ], mainLightNames)
}


export function getFreddyScene(...mainLightNames: string[]): Event[] {
    return buildEventsForLights(
        [
            new StableColourPattern(white, 60, 10, 0),
            new SoundPattern("resources/freddy.mp3", new StableColourPattern(red, 70, 29, 29), 0.1, 0.8),
            // new StableColourPattern(red, 70, 18, 0),
        ], mainLightNames)
}