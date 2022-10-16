import { RingDeviceData } from "ring-client-api";
import { HueSensorUpdate } from "../hue/sensor";
import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
import { RingEnhancedSpookinatorV2 } from "../ring";
import { SpookyHueApi } from "../hue/hue";
import { SpookyHueBulbPlayer } from "../hue/spooky_bulb_player";
import { Event } from "./events";

const log: CategoryLogger = getLogger("scenes");

/**
 * A scene is something that uses a ring or hue callback to change some lights, display something, or play audio
 */
export abstract class Scene {
  ringCallback: [string, (data: RingDeviceData) => void] | null;
  hueCallback: [number, (update: HueSensorUpdate) => void] | null;

  constructor() {
    this.ringCallback = null;
    this.hueCallback = null;
  }

  abstract setup(
    ringFunction: () => Promise<RingEnhancedSpookinatorV2>,
    hueFunction: () => Promise<SpookyHueApi>
  ): Promise<void>;

  async start(
    ringFunction: () => Promise<RingEnhancedSpookinatorV2>,
    hueFunction: () => Promise<SpookyHueApi>
  ): Promise<void> {
    await this.setup(ringFunction, hueFunction);

    if (this.ringCallback != null) {
      var [ringId, ringCallback] = this.ringCallback;
      var ring = await ringFunction();
      const sensors = await ring.getSensors();
      sensors.forEach((s) => {
        if (ringId == s.name) {
          ring.addSensorCallback(s, ringCallback);
        }
      });
    }
    if (this.hueCallback != null) {
      var [hueId, hueCallback] = this.hueCallback;
      var spookhue = await hueFunction();

      const hueWalkwaySensor = await spookhue.getSensor(hueId);
      log.info(`found hue sensor: ${hueWalkwaySensor.toString()}`);

      hueWalkwaySensor.addCallback(hueCallback);
      hueWalkwaySensor.start();
    }
  }
}

/**
 * This is a scene that is triggered by a ring event, and does not need
 * unspooky patterns b/c the spooky events reset them at the end.
 *
 * For this type of scene, the spooky scenes will always finish playing.
 */
export class AutoResetRingScene extends Scene {
  ringSensorName: string;
  spookyEvents: Event[];
  spookOnFaulted: boolean;

  constructor(
    ringSensorName: string,
    spookyEvents: Event[],
    spookOnFaulted: boolean = false
  ) {
    super();
    this.ringSensorName = ringSensorName;
    this.spookyEvents = spookyEvents;
    this.spookOnFaulted = spookOnFaulted;
  }

  async setup(
    _ringFunction: () => Promise<RingEnhancedSpookinatorV2>,
    hueFunction: () => Promise<SpookyHueApi>
  ): Promise<void> {
    const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());

    this.ringCallback = [
      this.ringSensorName,
      (data: RingDeviceData) => {
        log.info(`callback called on ${data.name}`);

        // if the data.faulted is true, that means that the door is open
        if (
          (data.faulted && this.spookOnFaulted) ||
          (!data.faulted && !this.spookOnFaulted)
        ) {
          this.spookyEvents.forEach((event) => {
            spookyHueBulbPlayer.playPattern(event);
          });
        }
      },
    ];
  }
}

export class MultiPartScene extends Scene {
  ringSensorName: string;
  hueSensorId?: number;
  spookyEvents: Event[];
  unSpookyEvents: Event[];
  spookOnFaulted: boolean;

  constructor(
    ringSensorName: string,
    spookyEvents: Event[],
    unSpookyEvents: Event[],
    hueSensorId?: number,
    spookOnFaulted: boolean = false
  ) {
    super();
    this.ringSensorName = ringSensorName;
    this.spookyEvents = spookyEvents;
    this.unSpookyEvents = unSpookyEvents;
    this.hueSensorId = hueSensorId;
    this.spookOnFaulted = spookOnFaulted;
  }

  async setup(
    _ringFunction: () => Promise<RingEnhancedSpookinatorV2>,
    hueFunction: () => Promise<SpookyHueApi>
  ): Promise<void> {
    const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());

    this.ringCallback = [
      this.ringSensorName,
      (data: RingDeviceData) => {
        log.info(`callback called on ${data.name}`);

        // if the data.faulted is true, that means that the door is open
        if (data.faulted) {
          if (this.spookOnFaulted) {
            this.spookyEvents.forEach((event) => {
              spookyHueBulbPlayer.playPattern(event);
            });
          } else {
            this.unSpookyEvents.forEach((event) => {
              spookyHueBulbPlayer.playPattern(event);
            });
          }
        } else {
          if (this.spookOnFaulted) {
            this.unSpookyEvents.forEach((event) => {
              spookyHueBulbPlayer.playPattern(event);
            });
          } else {
            this.spookyEvents.forEach((event) => {
              spookyHueBulbPlayer.playPattern(event);
            });
          }
        }
      },
    ];

    if (this.hueSensorId) {
      this.hueCallback = [
        this.hueSensorId,
        (data: HueSensorUpdate) => {
          log.info(
            `callback called on ${this.hueSensorId} => ${data.getPresence()}`
          );

          if (data.getPresence()) {
            this.spookyEvents.forEach((event) => {
              spookyHueBulbPlayer.playPattern(event);
            });
          } else {
            this.unSpookyEvents.forEach((event) => {
              spookyHueBulbPlayer.playPattern(event);
            });
          }
        },
      ];
    }
  }
}

class RandomMultiScene extends Scene {
  ringSensorName: string;
  spookyEventChoices: Event[][];
  unSpookyEvents: Event[];

  constructor(
    ringSensorName: string,
    spookyEventChoices: Event[][],
    unSpookyEvents: Event[]
  ) {
    super();
    this.ringSensorName = ringSensorName;
    this.spookyEventChoices = spookyEventChoices;
    this.unSpookyEvents = unSpookyEvents;
  }

  async setup(
    _ringFunction: () => Promise<RingEnhancedSpookinatorV2>,
    hueFunction: () => Promise<SpookyHueApi>
  ): Promise<void> {
    const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());

    this.ringCallback = [
      this.ringSensorName,
      (data: RingDeviceData) => {
        log.info(`callback called on ${data.name}`);

        // if the data.faulted is true, that means that the door is open and we should resort to the
        // unspooky base pattern
        // otherwise, pick a random pattern and play it!
        let patternWorkflow: Event[];
        if (data.faulted) {
          patternWorkflow = this.unSpookyEvents;
        } else {
          const patternIndex = Math.floor(
            Math.random() * this.spookyEventChoices.length
          );
          log.debug(`choosing pattern #${patternIndex}`);
          patternWorkflow = this.spookyEventChoices[patternIndex];
        }

        patternWorkflow.forEach((event) => {
          spookyHueBulbPlayer.playPattern(event);
        });
      },
    ];
  }
}

/**
 * Scene that repeats forever
 */
abstract class RepeatingScene extends Scene {
  private mainLightNames: string[];

  constructor(...mainLightNames: string[]) {
    super();
    this.mainLightNames = mainLightNames;
  }

  async setup(
    _ringFunction: () => Promise<RingEnhancedSpookinatorV2>,
    hueFunction: () => Promise<SpookyHueApi>
  ): Promise<void> {
    const spookyHueBulbPlayer = new SpookyHueBulbPlayer(await hueFunction());
    // Setup infinitely repeating light patterns
    this.getRepeatingEvents(...this.mainLightNames).forEach((event) => {
      spookyHueBulbPlayer.playRepeatingEvent(event);
    });
  }

  abstract getRepeatingEvents(...lightNames: string[]): Event[];
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
