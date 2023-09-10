import { Injectable } from "@nestjs/common";
import { ListProjectsMenuItem } from "./menus/list.mjs";
import { CreateProjectMenuItem } from "./menus/create.mjs";
import { SyncProjectMenuItem } from "./menus/sync.mjs";
import { MenuFactory } from "../lib/menus/factory.js";
import { RemoveProjectsMenuItem } from "./menus/remove.mjs";
import { cancelMenuItem } from "#app/lib/menus/cancel.ts";

@Injectable()
export class ProjectMenu extends MenuFactory {
  constructor(
    listProjectsMenuItem: ListProjectsMenuItem,
    createProjectMenuItem: CreateProjectMenuItem,
    syncProjectsMenuItem: SyncProjectMenuItem,
    removeProjectsMenuItem: RemoveProjectsMenuItem,
  ) {
    super("Projects", [
      listProjectsMenuItem,
      createProjectMenuItem,
      syncProjectsMenuItem,
      removeProjectsMenuItem,
      cancelMenuItem(),
    ]);
  }
}
