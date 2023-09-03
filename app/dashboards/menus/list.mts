import { Injectable } from "@nestjs/common";
import { run } from "../../lib/actions/run.js";
import { MenuItem } from "../../lib/menus/types.js";
import { LocalDashboardsRepository } from "../../../data/local_dashboards_repository.mjs";

@Injectable()
export class ListDashboardsMenuItem implements MenuItem {
  readonly name = "List dashboards";

  constructor(
    private readonly dashboardsRepository: LocalDashboardsRepository,
  ) {}

  async run(): Promise<void> {
    const dashboards = await run("Get dashboards", () =>
      this.dashboardsRepository.getDashboards(),
    );
    console.table(dashboards);
  }
}
