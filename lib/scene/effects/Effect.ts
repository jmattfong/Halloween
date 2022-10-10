import { CategoryLogger } from "typescript-logging";
import { Event, NewEvent } from "../../events/Event";
import EventBridge from "../../events/EventBridge";
import { getLogger } from "../../logging";

const log: CategoryLogger = getLogger("effect");

export default abstract class Effect extends Event.Source {
  private readonly eventBridge: EventBridge;
  private readonly delayInSeconds: number;

  constructor(
    eventBridge: EventBridge,
    type: string,
    name: string,
    delayInSeconds: number
  ) {
    super("Effect", type, name);
    this.eventBridge = eventBridge;
    this.delayInSeconds = delayInSeconds;
  }

  abstract perform(): void;

  async trigger(): Promise<void> {
    log.debug(
      `Performing effect: ${this.fullName()} in ${
        this.delayInSeconds
      } seconds...`
    );

    setTimeout(() => {
      this.perform();
      this.eventBridge.post(new NewEvent(this, "triggered"));
    }, this.delayInSeconds * 1000);
  }
}
