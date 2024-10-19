import { SpookyHueApi } from "../hue/hue";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
import { SpookyHueBulbPlayer } from "../hue/spooky_bulb_player";
import { Event } from "./events";
import { Color, ENERGIZE } from "../config";
import LightState = require("node-hue-api/lib/model/lightstate/LightState");
import { SoundPlayer } from "../sound/sound";

const log: CategoryLogger = getLogger("hue-pattern");

export abstract class Pattern {
  protected durationMs: number;
  constructor(durationSeconds: number) {
    this.durationMs = durationSeconds * 1000;
  }

  public getDurationMs() {
    return this.durationMs;
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    throw new Error("not implemented");
  }

  public cancel() {
    // do nothing
  }
}

function createLightState(
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
  let state: LightState = new LightState()
    .on(true)
    .bri(brightness)
    // Weird, but this is in increments of 100ms
    .transitiontime(transitionSeconds * 10);
  if (color.xy) {
    state = state.xy(color.xy[0], color.xy[1]);
  }
  if (color.hue) {
    state = state.hue(color.hue);
  }
  if (color.sat) {
    state = state.sat(color.sat);
  }
  return state;
}

// Lol this is highly functional code
export class SoundPattern extends Pattern {
  private soundFile: string;
  private soundPlayer: SoundPlayer;
  // The volume you want to play the audio at! Should be between 0 and 1
  private volume: number;
  private lightPattern: Pattern;
  private soundToPatternDelayMs: number;
  private stopSoundOnCancel: boolean;

  constructor(
    soundFile: string,
    lightPattern: Pattern,
    soundToPatternDelaySeconds: number,
    volume: number = 1,
    stopSoundOnCancel: boolean = false,
  ) {
    super(lightPattern.getDurationMs());
    this.soundFile = soundFile;

    if (volume <= 0 || volume > 1) {
      throw RangeError("volume be in the range (0,1]");
    }

    this.volume = volume;
    this.lightPattern = lightPattern;
    this.soundToPatternDelayMs = soundToPatternDelaySeconds * 1000;
    this.soundPlayer = new SoundPlayer();
    this.stopSoundOnCancel = stopSoundOnCancel;
  }

  public cancel() {
    log.info(`cancelling sound pattern`);
    this.lightPattern.cancel();
    if (this.stopSoundOnCancel) {
      log.info(`stopping sound: ${this.getSoundFile()}`);
      this.soundPlayer.stop(this.getSoundFile());
    }
  }

  getSoundFile(): string {
    return this.soundFile;
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    let soundFile = this.getSoundFile();
    await this.soundPlayer.play(soundFile, this.volume);
    await sleep(this.soundToPatternDelayMs);
    return this.lightPattern.run(lightName, lightApi);
  }
}

export class NoSoundPattern extends SoundPattern {
  constructor(lightPattern: Pattern, soundToPatternDelaySeconds: number = 0) {
    super("", lightPattern, soundToPatternDelaySeconds, 1);
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    this.cancel();
    return false;
  }
}

export class RandomSoundPattern extends SoundPattern {
  soundFiles: string[];
  constructor(
    soundFiles: string[],
    lightPattern: Pattern,
    soundToPatternDelaySeconds: number = 0,
    volume: number = 1,
  ) {
    super("", lightPattern, soundToPatternDelaySeconds, volume);
    this.soundFiles = soundFiles;
  }

  getSoundFile(): string {
    const index = Math.floor(Math.random() * this.soundFiles.length);
    log.debug(`random sound #: ${index + 1} / ${this.soundFiles.length}`);
    return this.soundFiles[index];
  }
}

export class FlickerPattern extends Pattern {
  color: Color;
  private maxBrightness: number;
  constructor(
    durationSeconds: number,
    color: Color = ENERGIZE,
    maxBrightness: number = 254,
  ) {
    super(durationSeconds);
    this.color = color;
    this.maxBrightness = maxBrightness;
  }

  isCancelled = false;
  public cancel() {
    this.isCancelled = true;
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    const startTime = new Date();

    let lightOn = true;
    while (!this.isCancelled) {
      let state = new LightState();
      if (lightOn) {
        let brightness = Math.min(getRandomInt(154) + 101, this.maxBrightness);
        state = createLightState(this.color, 0, brightness);
      } else {
        state = new LightState().on(false).transitiontime(0);
      }

      await lightApi.setLightState(lightName, state);
      const currTime = new Date();

      if (currTime.getTime() - startTime.getTime() > this.durationMs) {
        return false;
      }

      lightOn = !lightOn;
      await sleep(getRandomInt(50) + 10);
    }

    this.isCancelled = false;
    return true;
  }
}

/**
 * Creates a pattern where the lights colour randomly changes over the duration
 */
export class RandomColourPattern extends Pattern {
  // The list of colours to choose between
  private colours: Color[];

  // How long to wait between each colour change
  private colourDurationMs: number;

  // Whether the pattern has been cancelled
  // TODO: this should probably be in the base Pattern type
  private isCancelled;

  constructor(durationSeconds: number, ...colours: Color[]) {
    super(durationSeconds);
    this.colours = colours;
    this.colourDurationMs = 400;
    this.isCancelled = false;
  }

  public cancel() {
    this.isCancelled = true;
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    const start = new Date();

    // get the total numbers we chose between
    const numColours = this.colours.length;

    // we also keep track of the last colour index we used, to best effort
    // avoid doing the same colour twice in a row
    let previousColourIndex = -1;

    log.debug("running this pattern");
    log.debug(`my state is: ${this.isCancelled}`);

    while (!this.isCancelled) {
      // get a random index
      let colourIndex = Math.floor(Math.random() * numColours);

      // make sure we didn't just use that index
      if (colourIndex == previousColourIndex) {
        colourIndex = (colourIndex + 1) % numColours;
        previousColourIndex = colourIndex;
      }

      // get the colour and write it
      let selectedColour = this.colours[colourIndex];
      const state = createLightState(selectedColour, 0, 255);
      await lightApi.setLightState(lightName, state);

      await sleep(this.colourDurationMs);

      const now = new Date();

      if (now.getTime() - start.getTime() > this.durationMs) {
        return false;
      }
    }

    this.isCancelled = false;
    log.debug(`my state is: ${this.isCancelled}`);
    return true;
  }
}

export class SleepPattern extends Pattern {
  constructor(durationSeconds: number) {
    super(durationSeconds);
  }

  public cancel() {
    // cancel does nothing for sleep pattern, since we just sleep
  }

  public async run(
    _lightName: string,
    _lightApi: SpookyHueApi,
  ): Promise<boolean> {
    await sleep(this.durationMs);
    return false;
  }
}

export class PulsePattern extends Pattern {
  private color: Color;
  private transitionTimeSeconds: number;

  constructor(
    color: Color,
    durationSeconds: number,
    transitionTimeSeconds: number,
  ) {
    super(durationSeconds);
    this.color = color;
    this.transitionTimeSeconds = transitionTimeSeconds;
  }
  isCancelled = false;
  public cancel() {
    this.isCancelled = true;
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    this.isCancelled = false;
    const patternA = new StableColourPattern(
      this.color,
      100,
      this.transitionTimeSeconds,
      0,
    );
    const patternB = new StableColourPattern(
      this.color,
      0,
      this.transitionTimeSeconds,
      0,
    );

    const spookyBulbApi = new SpookyHueBulbPlayer(lightApi);

    const startTime = new Date();

    const intervalId = await spookyBulbApi.playRepeatingEvent(
      new Event(lightName, patternA, patternB),
    );

    while (!this.isCancelled) {
      const currTime = new Date();
      if (currTime.getTime() - startTime.getTime() > this.durationMs) {
        break;
      }

      await sleep(100);
    }

    clearInterval(intervalId);

    return this.isCancelled;
  }
}

export class OffPattern extends Pattern {
  private transitionSeconds: number;
  constructor(durationSeconds: number, transitionSeconds: number = 0) {
    super(durationSeconds);
    this.transitionSeconds = transitionSeconds;
  }

  isCancelled = false;
  public cancel() {
    this.isCancelled = true;
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    const state = new LightState()
      .off()
      // Weird, but this is in increments of 100ms
      .transitiontime(this.transitionSeconds * 10);
    await lightApi.setLightState(lightName, state);
    await sleep(this.durationMs);
    const wasCancelled = this.isCancelled;
    this.isCancelled = false;
    return wasCancelled;
  }
}

export class OnPattern extends Pattern {
  private transitionSeconds: number;
  private color: Color;

  constructor(
    color: Color,
    durationSeconds: number,
    transitionSeconds: number = 0,
  ) {
    super(durationSeconds);
    this.color = color;
    this.transitionSeconds = transitionSeconds;
  }

  isCancelled = false;
  public cancel() {
    this.isCancelled = true;
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    const state = createLightState(this.color, this.transitionSeconds);
    await lightApi.setLightState(lightName, state);
    await sleep(this.durationMs);
    const wasCancelled = this.isCancelled;
    this.isCancelled = false;
    return wasCancelled;
  }
}

export class StableColourPattern extends Pattern {
  private color: Color;
  private brightness: number;
  private transitionTimeSeconds: number;
  constructor(
    color: Color,
    brightness: number,
    durationSeconds: number,
    transitionTimeSeconds: number,
  ) {
    super(durationSeconds);
    this.color = color;
    this.brightness = brightness;
    this.transitionTimeSeconds = transitionTimeSeconds;
  }

  isCancelled = false;
  public cancel() {
    this.isCancelled = true;
  }

  public async run(
    lightName: string,
    lightApi: SpookyHueApi,
  ): Promise<boolean> {
    const state = createLightState(
      this.color,
      this.transitionTimeSeconds,
      this.brightness,
    );
    await lightApi.setLightState(lightName, state);
    await sleep(this.durationMs);
    const wasCancelled = this.isCancelled;
    this.isCancelled = false;
    return wasCancelled;
  }
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}
