import { select } from "@inquirer/prompts";
import { Injectable } from "@nestjs/common";
import { ListProjectsAction } from "./actions/list.mjs";
import { CreateProjectAction } from "./actions/create.mjs";
import { SyncProjectsAction } from "./actions/sync.mjs";

@Injectable()
export class ProjectMenu {
  constructor(
    private readonly listProjectsAction: ListProjectsAction,
    private readonly createProjectAction: CreateProjectAction,
    private readonly syncProjectsAction: SyncProjectsAction,
  ) {}

  async run() {
    const answer = await select({
      message: "Projects >",
      choices: [
        {
          name: "List projects",
          value: "list_projects",
        },
        {
          name: "Create project",
          value: "create_project",
        },
        {
          name: "Sync projects",
          value: "sync_projects",
        },
        {
          name: "Back",
          value: "back",
          description: "Cancel",
        },
      ],
    });

    switch (answer) {
      case "list_projects":
        return this.listProjectsAction.run();
      case "create_project":
        return this.createProjectAction.run();
      case "sync_projects":
        return this.syncProjectsAction.run();
      default:
        return Promise.resolve();
    }
  }
}
