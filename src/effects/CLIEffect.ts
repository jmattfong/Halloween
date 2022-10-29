import { Effect } from "../lib/scene/effects/Effect";

export class CLIEffect extends Effect {
  private readonly txtGen: () => Promise<void>;
  constructor({ name, txtGen }: CLIEffect.Params) {
    super({ type: "CLIEffect", name });

    this.txtGen = txtGen;
  }

  async perform(): Promise<void> {
    await this.txtGen();
  }
}

export namespace CLIEffect {
  export type Params = {
    name: string;
    txtGen: () => Promise<void>;
  };
}
