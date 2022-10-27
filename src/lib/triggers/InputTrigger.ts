import { NewEvent } from "../events/Event";
import { eventBridge } from "../events/EventBridge";
import { Trigger } from "./Trigger";

const readline = require("readline");

readline.emitKeypressEvents(process.stdin);

process.stdin.on("keypress", (_, key) => {
  if (key && key.ctrl && key.name === "c") {
    process.exit();
  }

  const mods: InputTrigger.Modifier[] = [];
  if (key.ctrl) mods.push(InputTrigger.Modifier.CTRL);
  if (key.alt) mods.push(InputTrigger.Modifier.ALT);
  if (key.meta) mods.push(InputTrigger.Modifier.META);
  let name = "[";
  for (const mod of mods) {
    name += `${mod.toString()}-`;
  }
  name += `${key.name}]`;
  eventBridge.post(
    new NewEvent(
      new InputTrigger({
        name,
        key: key.name,
        modifiers: mods,
      }),
      "pressed"
    )
  );
});

process.stdin.setRawMode(true);
process.stdin.resume();

export class InputTrigger extends Trigger {
  readonly key: string;
  readonly modifiers: InputTrigger.Modifier[];

  constructor({ name, key, modifiers }: InputTrigger.Params) {
    super({
      name,
      type: "InputTrigger",
    });
    this.key = key;
    this.modifiers = modifiers;
  }
}

export namespace InputTrigger {
  export type Params = {
    name: string;
    key: string;
    modifiers: Modifier[];
  };

  export enum Modifier {
    CTRL = "Ctrl",
    ALT = "Alt",
    META = "Meta",
  }
}
