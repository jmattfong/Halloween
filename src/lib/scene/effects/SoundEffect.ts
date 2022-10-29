import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../../logging";
import { SoundPlayer } from "../../sound/sound";
import { Effect } from "./Effect";

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
  private soundPlayer: SoundPlayer;

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
    this.soundPlayer = new SoundPlayer();
  }

  abstract getSoundFile(): string;

  async perform(): Promise<void> {
    const soundFile = this.getSoundFile();

    return this.soundPlayer.play(soundFile, this.volume);

  }
}
