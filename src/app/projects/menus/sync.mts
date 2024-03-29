import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "#data/local/projects_repository.mjs";
import { run } from "../../lib/actions/run.js";
import { SyncProjectAction } from "../actions/sync.mjs";
import { MenuItem } from "../../lib/menus/types.js";
import { zip } from "rambda";
import padEnd from "lodash/padEnd.js";
import { selectProjects } from "../../lib/prompts/projects.mjs";

@Injectable()
export class SyncProjectMenuItem implements MenuItem {
  readonly name = "Sync projects";

  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly action: SyncProjectAction,
  ) {}

  async run(): Promise<void> {
    const projects = await this.projectsRepository.getProjects();

    const projectIds = await selectProjects(projects);

    const selectedProjects = projects.filter((project) =>
      projectIds.includes(project.id),
    );

    const actionNames = selectedProjects.map(
      (project) => `Syncing project ${project.name}`,
    );
    const maxLength = Math.max(...actionNames.map((name) => name.length));

    for (const [project, name] of zip(selectedProjects, actionNames)) {
      await run(padEnd(name, maxLength + 1), (onUpdate) =>
        this.action.run({ project }, onUpdate),
      );
    }
  }
}
