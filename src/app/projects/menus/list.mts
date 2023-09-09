import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "#data/local/projects_repository.mjs";
import { run } from "../../lib/actions/run.js";
import { MenuItem } from "../../lib/menus/types.js";

@Injectable()
export class ListProjectsMenuItem implements MenuItem {
  readonly name = "List projects";

  constructor(private readonly projectsRepository: LocalProjectsRepository) {}

  async run(): Promise<void> {
    const projects = await run("Get projects", () =>
      this.projectsRepository.getProjects(),
    );
    console.table(projects);
  }
}
