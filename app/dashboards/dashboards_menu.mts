import { Injectable } from "@nestjs/common";
import { MenuFactory } from "../lib/menus/factory.js";
import { ListDashboardsMenuItem } from "./menus/list.mjs";
import { CreateDashboardMenuItem } from "./menus/create.mjs";
import { SyncDashboardMenuItem } from "./menus/sync.mjs";

@Injectable()
export class DashboardMenu extends MenuFactory {
  constructor(
    listDashboardsMenuItem: ListDashboardsMenuItem,
    createDashboardsMenuItem: CreateDashboardMenuItem,
    syncDashboardMenuItem: SyncDashboardMenuItem,
  ) {
    super("Dashboards", [
      listDashboardsMenuItem,
      createDashboardsMenuItem,
      syncDashboardMenuItem,
    ]);
  }
}
