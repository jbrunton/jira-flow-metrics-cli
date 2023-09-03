import { Module } from "@nestjs/common";
import { SyncProjectAction } from "./actions/sync.mjs";
import { ProjectMenu } from "./projects_menu.mjs";
import { ListProjectsMenuItem } from "./menus/list.mjs";
import { CreateProjectMenuItem } from "./menus/create.mjs";
import { SyncProjectMenuItem } from "./menus/sync.mjs";

@Module({
  providers: [
    CreateProjectMenuItem,
    ListProjectsMenuItem,
    SyncProjectAction,
    SyncProjectMenuItem,
    ProjectMenu,
  ],
  exports: [ProjectMenu],
})
export class ProjectsModule {}
