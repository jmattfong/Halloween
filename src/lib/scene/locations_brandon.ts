export const front_patio: string = "front_patio";
export const foyer: string = "foyer";
export const living_room: string = "living_room";
export const primary_bedroom: string = "primary_bedroom";
export const dining_room: string = "dining_room";
export const reading_lamp: string = "reading_lamp";
export const upstairs_hallway: string = "upstairs_hallway";
export const kitchen: string = "kitchen";
export const upstairs_bathroom: string = "upstairs_bathroom";
export const staircase: string = "staircase";
export const media_room: string = "media_room";
export const the_lady_hole: string = "the_lady_hole";
export const water_heater: string = "water_heater";
export const downstairs_hallway: string = "downstairs_hallway";
export const downstairs_bedroom: string = "downstairs_bedroom";
export const downstairs_bathroom: string = "downstairs_bathroom";
export const garage: string = "garage";
export const power_switch: string = "power_switch";
export const werewolf_scene: string = "werewolf_scene";
export const clown_room: string = "clown_room";
export const halloween_hallway: string = "halloween_hallway";
export const photobooth_spooks: string = "photobooth_spooks";
export const workout_room: string = "workout_room";

export const LIGHTS = {
    front_patio: ["19"],
    foyer: ["1"],
    living_room: ["1", "2", "9", "18", "23", "25"],
    primary_bedroom: ["10", "11"],
    dining_room: ["25"],
    reading_lamp: ["18"],
    upstairs_hallway: ["3", "8"],
    kitchen: ["6", "7"],
    upstairs_bathroom: ["16"],
    staircase: ["26"],
    media_room: ["29, 30"],
    the_lady_hole: [],
    water_heater: ["12"],
    downstairs_hallway: ["27", "28"],
    downstairs_bedroom: ["20", "22"],
    downstairs_bathroom: ["13", "22"],
    garage: ["32"],
    power_switch: ["33"],
    // Scene specific
    werewolf_scene: ["12", "20"],
    clown_room: ["2", "9", "23"],
    halloween_hallway: ["3", "8"],
    photobooth_spooks: [], // TODO find lights
    workout_room: ["11", "31"]
} as const;

export function getLights(roomName: string): string[] {
    return Object.assign([], LIGHTS[roomName]);
}
