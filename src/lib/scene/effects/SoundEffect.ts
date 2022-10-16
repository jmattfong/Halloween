import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../../logging";
import { Effect } from "./Effect";

const player = require("sound-play");
const log: CategoryLogger = getLogger("sound-effect");

export namespace SoundEffect {
  export type Params = {
    type?: string;
    name: string;
    volume?: number;
    delayInSeconds?: number;
  };
}
export abstract class SoundEffect extends Effect {
  readonly volume: number;

  constructor({
    type = "SoundEffect",
    name,
    volume = 0.5,
    delayInSeconds,
  }: SoundEffect.Params) {
    super({
      type,
      name,
      delayInSeconds,
    });
    this.volume = volume;
  }

  abstract getSoundFile(): string;

  async perform(): Promise<void> {
    const soundFile = this.getSoundFile();

    player.play(soundFile, this.volume).then((error: any) => {
      if (error) {
        log.error(`Something went wrong playing ${soundFile}`, error);
      } else {
        log.info(`Playing ${soundFile} is complete`);
      }
    });
  }
}
