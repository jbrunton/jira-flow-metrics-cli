import { select } from "@inquirer/prompts";
import { Injectable } from "@nestjs/common";
import { MetricsMenu } from "./metrics/metrics_menu.mjs";
import { ProjectMenu } from "./projects/projects_menu.mjs";
import { DashboardMenu } from "./dashboards/dashboards_menu.mjs";

@Injectable()
export class MainMenu {
  constructor(
    private readonly metricsMenu: MetricsMenu,
    private readonly projectsMenu: ProjectMenu,
    private readonly dashboardsMenu: DashboardMenu,
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
          name: "Dashboards",
          value: "dashboards",
        },
        {
          name: "Quit",
          value: "quit",
          description: "Exit the program",
        },
      ],
    });

    if (answer === "metrics") {
      await this.metricsMenu.run();
    }

    if (answer === "projects") {
      await this.projectsMenu.run();
    }

    if (answer === "dashboards") {
      await this.dashboardsMenu.run();
    }

    if (answer !== "quit") {
      await this.run();
    }
  }
}
