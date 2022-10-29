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
  };
}
export abstract class Effect extends Event.Source {
  private readonly delayInSeconds: number;

  constructor({ type, name, delayInSeconds = 0 }: Effect.Params) {
    super("Effect", type, name);
    this.delayInSeconds = delayInSeconds;

    this.perform = this.perform.bind(this);
    this.trigger = this.trigger.bind(this);
  }

  abstract perform(): Promise<void>;

  async trigger(): Promise<void> {
    log.debug(
      `Performing effect: ${this.fullName()} in ${
        this.delayInSeconds
      } seconds...`
    );

    setTimeout(() => {
      this.perform();
      eventBridge.post(new NewEvent(this, "triggered"));
    }, this.delayInSeconds * 1000);
  }
}
