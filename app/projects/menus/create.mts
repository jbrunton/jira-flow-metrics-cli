import { Injectable } from "@nestjs/common";
import inquirer from "inquirer";
import { input, select } from "@inquirer/prompts";
import { JiraFiltersRepository } from "../../../data/jira_filters_repository.js";
import { run } from "../../lib/actions/run.js";
import { MenuItem } from "../../lib/menus/types.js";
import {
  CreateProjectAction,
  CreateProjectActionArgs,
} from "../actions/create.mjs";
import { JiraProjectsRepository } from "../../../data/jira_projects_repository.js";
import { Filter, JiraProject } from "../../../domain/entities.js";

@Injectable()
export class CreateProjectMenuItem implements MenuItem {
  readonly name = "Create project";

  constructor(
    private readonly filtersRepository: JiraFiltersRepository,
    private readonly projectsRepository: JiraProjectsRepository,
    private readonly createProjectAction: CreateProjectAction,
  ) {}

  async run(): Promise<void> {
    const args = await this.readArgs();
    await run("Create project", () => this.createProjectAction.run(args));
  }

  protected async readArgs(): Promise<CreateProjectActionArgs> {
    const sourceType = await select({
      message: "Choose a data source",
      choices: [
        { name: "Create from filter", value: "filter" },
        { name: "Create from project", value: "project" },
      ],
    });

    switch (sourceType) {
      case "filter":
        return this.createFromFilter();
      case "project":
        return this.createFromProject();
    }
  }

  protected async createFromFilter(): Promise<CreateProjectActionArgs> {
    const minLength = 2;

    const { filter } = await inquirer.prompt({
      type: "autocomplete",
      name: "filter",
      message: "Select a filter",
      emptyText: "No results",
      suffix: `(type ${minLength} chars)`,
      source: async (
        _: object,
        input: string,
      ): Promise<{ name: string; value: Filter }[]> => {
        if (!input || input.length < minLength) {
          return [];
        }

        const filters = await this.filtersRepository.getFilters(input);

        return filters.map((filter) => ({
          name: filter.name,
          value: filter,
        }));
      },
    });

    const name = await input({
      message: "Enter the project name",
      default: filter.name,
    });

    return { name, jql: filter.jql };
  }

  protected async createFromProject(): Promise<CreateProjectActionArgs> {
    const minLength = 2;

    const { project } = await inquirer.prompt({
      type: "autocomplete",
      name: "project",
      message: "Select a project",
      emptyText: "No results",
      suffix: `(type ${minLength} chars)`,
      source: async (
        _: object,
        input: string,
      ): Promise<{ name: string; value: JiraProject }[]> => {
        if (!input || input.length < minLength) {
          return [];
        }

        const projects = await this.projectsRepository.getProjects(input);

        return projects.map((project) => ({
          name: `${project.name} (${project.key})`,
          value: project,
        }));
      },
    });

    const name = await input({
      message: "Enter the project name",
      default: project.name,
    });

    return { name, jql: `project=${project.key}` };
  }
}
