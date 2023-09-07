import { Injectable } from "@nestjs/common";
import { MetricsMenu } from "./metrics/metrics_menu.mjs";
import { ProjectMenu } from "./projects/projects_menu.mjs";
import { DashboardMenu } from "./dashboards/dashboards_menu.mjs";
import { MenuFactory } from "./lib/menus/factory.js";
import { cancelMenuItem } from "./lib/menus/cancel.js";

@Injectable()
export class MainMenu extends MenuFactory {
  constructor(
    metricsMenu: MetricsMenu,
    projectsMenu: ProjectMenu,
    dashboardsMenu: DashboardMenu,
  ) {
    super("Select an option", [
      metricsMenu,
      projectsMenu,
      dashboardsMenu,
      cancelMenuItem("Quit"),
    ]);
  }
}
