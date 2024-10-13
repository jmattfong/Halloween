import { SpookyHueApi } from "./hue";
import { Pattern } from "../scene/patterns";
import { Event } from "../scene/events";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";

const log: CategoryLogger = getLogger("spooky-bulb-player");

export class SpookyHueBulbPlayer {
  api: SpookyHueApi;
  private currPatternMap: Map<string, Pattern>;

  constructor(api: SpookyHueApi) {
    this.api = api;
    this.currPatternMap = new Map();
  }

  public async playPattern(event: Event) {
    if (!this.api.getIsConnected()) {
      throw new Error("not connected to the hue hub");
    }

    let lightName = event.lightName;
    if (this.currPatternMap.has(lightName)) {
      log.info("interrupt current pattern");
      let bulb = this.currPatternMap.get(lightName);
      if (bulb) {
        log.info(`cancelling bulb: ${lightName}`);
        bulb.cancel();
      }
    }

    let patterns = event.patterns;
    log.debug(`pattern playing: ${patterns}`);
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      log.info(
        `playing pattern: ${pattern.constructor.name} on light #${lightName}`,
      );
      this.currPatternMap.set(lightName, pattern);
      const wasCancelled = await pattern.run(lightName, this.api);
      if (wasCancelled) {
        log.info("canceled pattern");
        return;
      }
    }

    this.currPatternMap.delete(lightName);
  }

  public async playRepeatingEvent(event: Event): Promise<NodeJS.Timeout> {
    if (!this.api.getIsConnected()) {
      throw new Error("not connected to the hue hub");
    }

    let patterns = event.patterns;
    const totalPatternLengthMs = patterns
      .map((p) => p.getDurationMs())
      .reduce((a, b) => a + b);
    log.info("playing repeated light pattern: " + patterns);
    return setInterval(
      (() => {
        log.debug("running repeating pattern");
        this.playPattern(event);
      }).bind(this),
      totalPatternLengthMs + 100,
    );
  }
}
