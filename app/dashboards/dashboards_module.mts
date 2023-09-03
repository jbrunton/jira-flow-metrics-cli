import { Module } from "@nestjs/common";
import { DashboardMenu } from "./dashboards_menu.mjs";
import { ListDashboardsMenuItem } from "./menus/list.mjs";
import { CreateDashboardAction } from "./actions/create.mjs";
import { AddDashboardMenuItem } from "./menus/add.mjs";
import { SyncDashboardMenuItem } from "./menus/sync.mjs";
import { SyncProjectAction } from "../projects/actions/sync.mjs";
import { CreateProjectAction } from "../projects/actions/create.mjs";
import { CycleTimesReportAction } from "../metrics/cycle_times/action.js";
import { CreateDashboardMenuItem } from "./menus/create.mjs";

@Module({
  providers: [
    ListDashboardsMenuItem,
    CreateDashboardMenuItem,
    CreateDashboardAction,
    AddDashboardMenuItem,
    SyncProjectAction,
    CreateProjectAction,
    SyncDashboardMenuItem,
    CycleTimesReportAction,
    DashboardMenu,
  ],
  exports: [DashboardMenu],
})
export class DashboardsModule {}
