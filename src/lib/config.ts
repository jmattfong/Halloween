import { readFileSync } from 'fs';

const configContents = readFileSync('./config/config.json', { encoding: 'utf-8' });
export const CONFIG = JSON.parse(configContents);

export const RED: Color = CONFIG.colors.red
export const RELAX: Color = CONFIG.colors.relax
export const CONCENTRATE: Color = CONFIG.colors.concentrate
export const ENERGIZE: Color = CONFIG.colors.energize
export const DIMMED: Color = CONFIG.colors.dimmed
export const NIGHTLIGHT: Color = CONFIG.colors.nightlight

export type Color = {
    bri: number
    hue: number,
    sat: number,
    xy: number[],
    ct: number
}
