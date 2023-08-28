import { Injectable } from "@nestjs/common";
import { CycleTimesAction } from "./actions/cycle_times_menu.mjs";
import { select } from "@inquirer/prompts";

@Injectable()
export class MetricsMenu {
  constructor(private readonly cycleTimesAction: CycleTimesAction) {}

  async run() {
    const answer = await select({
      message: "Metrics >",
      choices: [
        {
          name: "Cycle times",
          value: "cycle_times",
        },
        {
          name: "Back",
          value: "back",
          description: "Cancel",
        },
      ],
    });

    switch (answer) {
      case "cycle_times":
        return this.cycleTimesAction.run();
      default:
        return Promise.resolve();
    }
  }
}
