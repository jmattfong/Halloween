import { Video } from "../../videos";
import { Effect } from "./Effect";

export abstract class VideoPlaybackEffect extends Effect {
  protected readonly video: Video;

  constructor({
    type = "VideoPlaybackEffect",
    name,
    video,
    delayInSeconds,
  }: VideoPlaybackEffect.Params) {
    super({ type, name, delayInSeconds });
    this.video = video;
  }
}

export namespace VideoPlaybackEffect {
  export type Params = {
    type?: string;
    name: string;
    video: Video;
    delayInSeconds?: number;
  };
}
