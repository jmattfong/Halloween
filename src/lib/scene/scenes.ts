import { getLogger } from "../logging";
import { CategoryLogger } from "typescript-logging";
import { SensorType } from "../web_listener/webserver";
import { SpookyHueBulbPlayer } from "../hue/spooky_bulb_player";
import { Event } from "./events";

const log: CategoryLogger = getLogger("scenes");

/**
 * A scene is something that uses a ring or hue callback to change some lights, display something, or play audio
 */
export abstract class Scene {
  abstract run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void>;
}

/**
 * This is a scene that does not need unspooky patterns b/c the spooky
 * events reset them at the end.
 *
 * For this type of scene, the spooky scenes will always finish playing.
 */
export class AutoResetRingScene extends Scene {
  spookyEvents: Event[];
  spookOnFaulted: boolean;

  constructor(spookyEvents: Event[], spookOnFaulted: boolean = false) {
    super();
    this.spookyEvents = spookyEvents;
    this.spookOnFaulted = spookOnFaulted;
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    // if the data.faulted is true, that means that the door is open
    if (
      sensorType === SensorType.MANUAL ||
      (sensorTriggedOn && this.spookOnFaulted) ||
      (!sensorTriggedOn && !this.spookOnFaulted)
    ) {
      this.spookyEvents.forEach((event) => {
        spookyHueBulbPlayer.playPattern(event);
      });
    }
  }
}

export class MultiPartScene extends Scene {
  spookyEvents: Event[];
  unSpookyEvents: Event[];
  spookOnFaulted: boolean;

  constructor(
    spookyEvents: Event[],
    unSpookyEvents: Event[],
    spookOnFaulted: boolean = false,
  ) {
    super();
    this.spookyEvents = spookyEvents;
    this.unSpookyEvents = unSpookyEvents;
    this.spookOnFaulted = spookOnFaulted;
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    // if the data.faulted is true, that means that the door is open
    if (sensorType === SensorType.MANUAL || sensorTriggedOn) {
      if (sensorType === SensorType.MANUAL || this.spookOnFaulted) {
        this.unSpookyEvents.forEach((event) => { event.cancel(); });
        this.spookyEvents.forEach((event) => {
          spookyHueBulbPlayer.playPattern(event);
        });
      } else {
        this.spookyEvents.forEach((event) => { event.cancel(); });
        this.unSpookyEvents.forEach((event) => {
          spookyHueBulbPlayer.playPattern(event);
        });
      }
    } else {
      if (this.spookOnFaulted) {
        this.spookyEvents.forEach((event) => { event.cancel(); });
        this.unSpookyEvents.forEach((event) => {
          spookyHueBulbPlayer.playPattern(event);
        });
      } else {
        this.unSpookyEvents.forEach((event) => { event.cancel(); });
        this.spookyEvents.forEach((event) => {
          spookyHueBulbPlayer.playPattern(event);
        });
      }
    }
  }
}

export class SplitPartScene extends Scene {
  spookyHueEvents: Event[];
  spookyRingEvents: Event[];
  spookOnFaulted: boolean;
  private isRingRunning: boolean;

  constructor(
    spookyHueEvents: Event[],
    spookyRingEvents: Event[],
    spookOnFaulted: boolean = false,
  ) {
    super();
    this.spookyHueEvents = spookyHueEvents;
    this.spookyRingEvents = spookyRingEvents;
    this.spookOnFaulted = spookOnFaulted;
    this.isRingRunning = false;
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    if (sensorType == SensorType.RING) {
      // if the event data is true, that means that the door is open
      if (sensorTriggedOn) {
        log.info("door is open");
        if (this.spookOnFaulted) {
          log.info("canceling spooky hue events");
          this.spookyHueEvents.forEach((event) => {
            event.cancel();
          });
          this.spookyRingEvents.forEach((event) => {
            spookyHueBulbPlayer.playPattern(event);
          });
          // log.info("canceling spooky ring events");
          // this.spookyRingEvents.forEach((event) => {
          //     event.cancel();
          // });
        }
      } else {
        if (!this.spookOnFaulted) {
          log.info("canceling spooky hue events2");
          this.spookyHueEvents.forEach((event) => {
            event.cancel();
          });
          this.isRingRunning = true;
          spookyHueBulbPlayer.playPattern(this.spookyRingEvents[0]).then(() => {
            this.isRingRunning = false;
          });
          // this.spookyRingEvents.forEach(async event => {
          //   await spookyHueBulbPlayer.playPattern(event);
          // });
        }
      }
    }

    if (sensorType == SensorType.HUE) {
      if (sensorTriggedOn) {
        // log.info("canceling spooky hue events3");
        // this.spookyRingEvents.forEach((event) => {
        //   event.cancel();
        // });

        if (this.isRingRunning) {
          return;
        }

        this.spookyHueEvents.forEach((event) => {
          spookyHueBulbPlayer.playPattern(event);
        });
      }
    }
  }
}

export class RandomMultiScene extends Scene {
  spookyEventChoices: Scene[];
  unSpookyEvents: Event[];
  currentScene: Scene | null;

  constructor(spookyEventChoices: Scene[], unSpookyEvents: Event[]) {
    super();
    this.spookyEventChoices = spookyEventChoices;
    this.unSpookyEvents = unSpookyEvents;
    this.currentScene = null;
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
    log.debug("getting random spooky");

    const sceneIndex = Math.floor(
      Math.random() * this.spookyEventChoices.length,
    );
    log.info(`Choice num options: ${this.spookyEventChoices.length}`);
    log.info(`choosing pattern #${sceneIndex}`);
    this.currentScene = this.spookyEventChoices[sceneIndex];
    log.info(`Choice: ${this.currentScene.constructor.name}`);

    this.currentScene.run(spookyHueBulbPlayer, sensorType, sensorTriggedOn);
  }
}

/**
 * Scene that repeats forever
 */
export abstract class RepeatingScene extends Scene {
  private mainLightNames: string[];

  constructor(...mainLightNames: string[]) {
    super();
    this.mainLightNames = mainLightNames;
  }

  async run(
    spookyHueBulbPlayer: SpookyHueBulbPlayer,
    sensorType: SensorType,
    sensorTriggedOn: boolean,
  ): Promise<void> {
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
