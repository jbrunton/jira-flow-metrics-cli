import { Injectable } from "@nestjs/common";
import { CycleTimesAction } from "./actions/cycle_times.mjs";
import { select } from "@inquirer/prompts";
import { ThroughputAction } from "./actions/throughput.mjs";

@Injectable()
export class MetricsMenu {
  constructor(
    private readonly cycleTimesAction: CycleTimesAction,
    private readonly throughputAction: ThroughputAction,
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
        return this.cycleTimesAction.run();
      case "throughput":
        return this.throughputAction.run();
      default:
        return Promise.resolve();
    }
  }
}
