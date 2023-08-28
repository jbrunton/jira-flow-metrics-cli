import { Module } from "@nestjs/common";
import { CreateProjectAction } from "./actions/create.mjs";
import { ListProjectsAction } from "./actions/list.mjs";
import { SyncProjectsAction } from "./actions/sync.mjs";
import { ProjectMenu } from "./projects_menu.mjs";

@Module({
  providers: [
    CreateProjectAction,
    ListProjectsAction,
    SyncProjectsAction,
    ProjectMenu,
  ],
  exports: [ProjectMenu],
})
export class ProjectsModule {}
