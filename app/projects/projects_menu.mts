import { Injectable } from "@nestjs/common";
import { ListProjectsMenuItem } from "./menus/list.mjs";
import { CreateProjectMenuItem } from "./menus/create.mjs";
import { SyncProjectMenuItem } from "./menus/sync.mjs";
import { MenuFactory } from "../lib/menus/factory.js";

@Injectable()
export class ProjectMenu extends MenuFactory {
  constructor(
    listProjectsMenuItem: ListProjectsMenuItem,
    createProjectMenuItem: CreateProjectMenuItem,
    syncProjectsMenuItem: SyncProjectMenuItem,
  ) {
    super("Projects", [
      listProjectsMenuItem,
      createProjectMenuItem,
      syncProjectsMenuItem,
    ]);
  }
}
