import { Injectable } from "@nestjs/common";
import { MenuFactory } from "../lib/menus/factory.js";
import { ListDashboardsMenuItem } from "./menus/list.mjs";
import { AddDashboardMenuItem } from "./menus/add.mjs";
import { SyncDashboardMenuItem } from "./menus/sync.mjs";
import { CreateDashboardMenuItem } from "./menus/create.mjs";
import { cancelMenuItem } from "#app/lib/menus/cancel.ts";

@Injectable()
export class DashboardMenu extends MenuFactory {
  constructor(
    listDashboardsMenuItem: ListDashboardsMenuItem,
    createDashboardMenuItem: CreateDashboardMenuItem,
    addDashboardMenuItem: AddDashboardMenuItem,
    syncDashboardMenuItem: SyncDashboardMenuItem,
  ) {
    super("Dashboards", [
      listDashboardsMenuItem,
      createDashboardMenuItem,
      addDashboardMenuItem,
      syncDashboardMenuItem,
      cancelMenuItem(),
    ]);
  }
}
