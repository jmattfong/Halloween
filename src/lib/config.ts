import { readFileSync } from "fs";

const configContents = readFileSync("./config/config.json", {
  encoding: "utf-8",
});
export const CONFIG = JSON.parse(configContents);

export const RED: Color = {
  bri: 254,
  hue: 65472,
  sat: 254,
  xy: [0.6896, 0.3074],
  ct: 500,
};

export const ORANGE: Color = {
  bri: 144,
  hue: 2954,
  sat: 254,
  xy: [0.6313, 0.3535],
  ct: 366,
};

export const YELLOW: Color = {
  bri: 254,
  hue: 10540,
  sat: 254,
  xy: [0.4871, 0.4618],
  ct: 366,
};

export const GREEN: Color = {
  bri: 254,
  hue: 20064,
  sat: 254,
  xy: [0.2828, 0.6153],
  ct: 153,
};

export const BLUE: Color = {
  bri: 254,
  hue: 65472,
  sat: 254,
  xy: [0.1549, 0.1148],
  ct: 500,
};

export const PURPLE: Color = {
  bri: 160,
  hue: 49766,
  sat: 254,
  xy: [0.2624, 0.1005],
  ct: 366,
};

export const LAVENDER: Color = {
  bri: 211,
  hue: 50422,
  sat: 209,
  xy: [0.2732, 0.1445],
  ct: 153,
};

const SOFT = { bri: 25 };
export const SOFT_RED: Color = { ...RED, ...SOFT };

export const DARK_GREEN: Color = {
  bri: 92,
  hue: 22291,
  sat: 254,
  xy: [0.2374, 0.6494],
  ct: 443,
}

export const RELAX: Color = {
  bri: 144,
  hue: 65472,
  sat: 254,
  xy: [0.5019, 0.4152],
  ct: 447,
};

export const CONCENTRATE: Color = {
  bri: 254,
  hue: 41442,
  sat: 75,
  xy: [0.3691, 0.3719],
  ct: 233,
};

export const ENERGIZE: Color = {
  bri: 254,
  hue: 41442,
  sat: 75,
  xy: [0.3143, 0.3301],
  ct: 156,
};

export const DIMMED: Color = {
  bri: 77,
  hue: 8402,
  sat: 140,
  xy: [0.4575, 0.4099],
  ct: 366,
};

export const NIGHTLIGHT: Color = {
  bri: 1,
  hue: 6291,
  sat: 251,
  xy: [0.5612, 0.4042],
  ct: 500,
};

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
