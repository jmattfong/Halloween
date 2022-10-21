import { Chromecaster } from "../lib/chromecast";
import { VideoPlaybackEffect } from "../lib/scene/effects/VideoPlaybackEffect";
import { Video } from "../lib/videos";

const chromecaster = new Chromecaster();

export class ChromecastPlaybackEffect extends VideoPlaybackEffect {
  constructor({ video, delayInSeconds }: ChromecastPlaybackEffect.Params) {
    super({ video, name: "ChromecastPlaybackEffect", delayInSeconds });
  }

  static async setup() {
    await chromecaster.start();
  }

  async perform(): Promise<void> {
    await chromecaster.playVideo(this.video);
  }
}

export namespace ChromecastPlaybackEffect {
  export type Params = {
    video: Video;
    delayInSeconds?: number;
  };
}
