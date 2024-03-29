import { Module } from "@nestjs/common";
import { SyncProjectAction } from "./actions/sync.mjs";
import { ProjectMenu } from "./projects_menu.mjs";
import { ListProjectsMenuItem } from "./menus/list.mjs";
import { CreateProjectMenuItem } from "./menus/create.mjs";
import { SyncProjectMenuItem } from "./menus/sync.mjs";
import { CreateProjectAction } from "./actions/create.mjs";
import { RemoveProjectsAction } from "./actions/remove.mjs";
import { RemoveProjectsMenuItem } from "./menus/remove.mjs";

@Module({
  providers: [
    CreateProjectAction,
    CreateProjectMenuItem,
    ListProjectsMenuItem,
    SyncProjectAction,
    SyncProjectMenuItem,
    RemoveProjectsAction,
    RemoveProjectsMenuItem,
    ProjectMenu,
  ],
  exports: [ProjectMenu],
})
export class ProjectsModule {}
