import { readFileSync } from "fs";

const configContents = readFileSync("./config/config.json", {
  encoding: "utf-8",
});
export const CONFIG = JSON.parse(configContents);

export const RED: Color = CONFIG.colors.red;
export const BLUE: Color = CONFIG.colors.blue;
export const GREEN: Color = CONFIG.colors.green;
export const PURP: Color = CONFIG.colors.purp;
const SOFT = { bri: 25 };
export const SOFT_RED: Color = { ...RED, ...SOFT };
export const RELAX: Color = CONFIG.colors.relax;
export const CONCENTRATE: Color = CONFIG.colors.concentrate;
export const ENERGIZE: Color = CONFIG.colors.energize;
export const DIMMED: Color = CONFIG.colors.dimmed;
export const NIGHTLIGHT: Color = CONFIG.colors.nightlight;
export const ORANGE: Color = CONFIG.colors.orange;

export const PURPLE: Color = {
  "bri": 160,
  "hue": 49766,
  "sat": 254,
  "xy": [
      0.2624,
      0.1005
  ],
  "ct": 366,
};

export const YELLOW: Color = {
  "bri": 254,
  "hue": 10540,
  "sat": 254,
  "xy": [
      0.4871,
      0.4618
  ],
  "ct": 366,
}

export type Color = {
  bri: number;
  hue?: number;
  sat?: number;
  xy?: number[];
  ct?: number;
};

export type Light = {
  id: number;
  type: string;
  name: string;
  productname: string;
};
