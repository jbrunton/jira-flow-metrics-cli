import { select } from "@inquirer/prompts";
import { Injectable } from "@nestjs/common";
import { MetricsMenu } from "./metrics/metrics_menu.mjs";
import { ProjectMenu } from "./projects/projects_menu.mjs";

@Injectable()
export class MainMenu {
  constructor(
    private readonly metricsMenu: MetricsMenu,
    private readonly projectsMenu: ProjectMenu,
  ) {}

  async run() {
    const answer = await select({
      message: "Select an option",
      choices: [
        {
          name: "Metrics",
          value: "metrics",
          description: "Cycle time metrics for longest stories",
        },
        {
          name: "Projects",
          value: "projects",
        },
        {
          name: "Quit",
          value: "quit",
          description: "Exit the program",
        },
      ],
    });

    console.group();

    if (answer === "metrics") {
      await this.metricsMenu.run();
    }

    if (answer === "projects") {
      await this.projectsMenu.run();
    }

    console.groupEnd();

    if (answer !== "quit") {
      await this.run();
    }
  }
}
