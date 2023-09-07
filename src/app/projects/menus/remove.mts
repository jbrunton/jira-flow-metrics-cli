import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "../../../data/local/projects_repository.mjs";
import { run } from "../../lib/actions/run.js";
import { MenuItem } from "../../lib/menus/types.js";
import { selectProjects } from "../../lib/prompts/projects.mjs";
import { confirm } from "@inquirer/prompts";
import { RemoveProjectsAction } from "../actions/remove.mjs";

@Injectable()
export class RemoveProjectsMenuItem implements MenuItem {
  readonly name = "Remove projects";

  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly removeProjectsAction: RemoveProjectsAction,
  ) {}

  async run(): Promise<void> {
    const projects = await this.projectsRepository.getProjects();
    const projectIds = await selectProjects(projects);
    //const selectedProjects = projects.filter(project => selectedProjectIds.includes(project.id));
    // const projects = await run("Get projects", () =>
    //   this.projectsRepository.getProjects(),
    // );
    const remove = await confirm({
      message: `Are you sure you want to remove the selected projects?`,
    });
    if (remove) {
      await run("Removing projects", () =>
        this.removeProjectsAction.run({ projectIds }),
      );
    }
  }
}
