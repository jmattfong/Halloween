import { CategoryLogger } from "typescript-logging";
import { Event, NewEvent } from "../../events/Event";
import { eventBridge } from "../../events/EventBridge";
import { getLogger } from "../../logging";

const log: CategoryLogger = getLogger("effect");

export namespace Effect {
  export type Params = {
    type: string;
    name: string;
    delayInSeconds?: number;
    childEffects?: Effect[];
  };
}
export abstract class Effect extends Event.Source {
  private readonly delayInSeconds: number;
  readonly childEffects: Effect[];

  constructor({
    type,
    name,
    delayInSeconds = 0,
    childEffects = [],
  }: Effect.Params) {
    super("Effect", type, name);
    this.delayInSeconds = delayInSeconds;
    this.childEffects = childEffects;

    this.perform = this.perform.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  protected abstract perform(): Promise<void>;

  async trigger(): Promise<void> {
    if (this.delayInSeconds) {
      log.debug(
        `Performing effect: ${this.fullName()} in ${
          this.delayInSeconds
        } seconds...`
      );
    }
    eventBridge.post(new NewEvent(this, "triggered"));

    return new Promise((resolve) => {
      setTimeout(async () => {
        this.perform();
        eventBridge.post(new NewEvent(this, "performing"));

        await Promise.all(
          this.childEffects.map((childEffect) => childEffect.trigger())
        );

        eventBridge.post(new NewEvent(this, "performed"));
        resolve();
      }, this.delayInSeconds * 1000);
    });
  }
}
