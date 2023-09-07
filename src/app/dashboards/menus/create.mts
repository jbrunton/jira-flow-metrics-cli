import { Injectable } from "@nestjs/common";
import { MenuItem } from "../../lib/menus/types.js";
import { input } from "@inquirer/prompts";
import { CreateDashboardAction } from "../actions/create.mjs";
import { selectProjects } from "../../lib/prompts/projects.mjs";
import { LocalProjectsRepository } from "../../../data/local/projects_repository.mjs";
import { DashboardDefinition } from "../../../domain/entities.js";

@Injectable()
export class CreateDashboardMenuItem implements MenuItem {
  readonly name = "Create dashboard";

  constructor(
    private readonly createDashboardAction: CreateDashboardAction,
    private readonly projectsRepository: LocalProjectsRepository,
  ) {}

  async run(): Promise<void> {
    const name = await input({
      message: "Dashboard name",
    });
    const projects = await this.projectsRepository.getProjects();
    const projectIds = await selectProjects(projects);
    const selectedProjects = projects.filter((project) =>
      projectIds.includes(project.id),
    );
    const definition: DashboardDefinition = {
      name,
      projects: selectedProjects,
    };

    await this.createDashboardAction.run({ definition });
  }
}
