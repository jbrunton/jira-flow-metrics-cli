import { Injectable } from "@nestjs/common";
import { select } from "@inquirer/prompts";
import { CycleTimesMenuItem } from "./cycle_times/menu.js";
import { ThroughputMenuItem } from "./throughput/menu.js";

@Injectable()
export class MetricsMenu {
  constructor(
    private readonly cycleTimesMenu: CycleTimesMenuItem,
    private readonly throughputMenu: ThroughputMenuItem,
  ) {}

  async run() {
    const answer = await select({
      message: "Metrics >",
      choices: [
        {
          name: "Cycle times",
          value: "cycle_times",
        },
        {
          name: "Throughput",
          value: "throughput",
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
        return this.cycleTimesMenu.run();
      case "throughput":
        return this.throughputMenu.run();
      default:
        return Promise.resolve();
    }
  }
}
