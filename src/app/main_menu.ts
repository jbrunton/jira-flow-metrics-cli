import { Injectable } from "@nestjs/common";
import { MetricsMenu } from "./metrics/metrics_menu.mts";
import { ProjectMenu } from "./projects/projects_menu.mts";
import { DashboardMenu } from "./dashboards/dashboards_menu.mts";
import { MenuFactory } from "./lib/menus/factory.ts";
import { cancelMenuItem } from "./lib/menus/cancel.ts";

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
