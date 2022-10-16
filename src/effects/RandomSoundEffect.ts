import { SoundEffect } from "../lib/scene/effects/SoundEffect";

namespace RandomSoundEffect {
  export type Params = {
    soundFiles: string[];
    delayInSeconds?: number;
  };
}
export class RandomSoundEffect extends SoundEffect {
  private readonly soundFiles: string[];

  constructor({ soundFiles, delayInSeconds }: RandomSoundEffect.Params) {
    super({
      name: "RandomSoundEffect",
      delayInSeconds,
    });
    this.soundFiles = soundFiles;
  }

  getSoundFile(): string {
    return this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
  }
}
