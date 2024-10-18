import { SpookyHueApi } from "./hue";
import { Pattern } from "../scene/patterns";
import { Event } from "../scene/events";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";

const log: CategoryLogger = getLogger("spooky-bulb-player");

export class SpookyHueBulbPlayer {
  api: SpookyHueApi;
  private currPatternMap: { [key: string]: Pattern };

  constructor(api: SpookyHueApi) {
    this.api = api;
    this.currPatternMap = {};
  }

  /**
   * Plays all of the patterns in an event
   *
   * This class keeps track of all ongoing events that are associated with a given
   * bulb and uses this information to determine whether we need to cancel any ongoing
   * events. If a light is playing and a new event for that same light is kicked off, we
   * attempt to kill the current event to play the new one.
   *
   * @param event The event to play
   */
  public async playPattern(event: Event) {
    if (!this.api.getIsConnected()) {
      throw new Error("not connected to the hue hub");
    }
    log.debug(`starting to play event: ${event.constructor.name}`)
    log.debug(`existing ongoing patterns: ${JSON.stringify(this.currPatternMap)}`)

    let lightName = event.lightName;
    if (lightName in this.currPatternMap) {
      log.info("interrupt current pattern");
      let bulb = this.currPatternMap[lightName];
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
      this.currPatternMap[lightName] = pattern;

      const wasCancelled = await pattern.run(lightName, this.api);
      if (wasCancelled) {
        log.info("canceled pattern");
        return;
      }
    }

    delete this.currPatternMap[lightName];
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
