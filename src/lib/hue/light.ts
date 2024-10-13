import LightState = require("node-hue-api/lib/model/lightstate/LightState");
import { Color } from "../config";

export function createLightState(
  color: Color,
  transitionSeconds: number,
  brightness?: number,
): LightState {
  if (brightness == null) {
    brightness = color.bri;
  }
  if (brightness > 254) {
    brightness = 254;
  } else if (brightness < 1) {
    brightness = 1;
  }
  return (
    new LightState()
      .on(true)
      .xy(color.xy[0], color.xy[1])
      .hue(color.hue)
      .sat(color.sat)
      //.ct(color.ct)
      .bri(brightness)
      // Weird, but this is in increments of 100ms
      .transitiontime(transitionSeconds * 10)
  );
}
