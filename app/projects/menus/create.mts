import { Injectable } from "@nestjs/common";
import inquirer from "inquirer";
import { input } from "@inquirer/prompts";
import { CreateProjectParams } from "../../../domain/entities.js";
import { JiraFiltersRepository } from "../../../data/jira_filters_repository.js";
import { run } from "../../lib/actions/run.js";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";
import { MenuItem } from "../../lib/menus/types.js";

@Injectable()
export class CreateProjectMenuItem implements MenuItem {
  readonly name = "Create project";

  constructor(
    private readonly filtersRepository: JiraFiltersRepository,
    private readonly projectsRepository: LocalProjectsRepository,
  ) {}

  async run(): Promise<void> {
    const args = await this.readArgs();
    await run("Create project", () =>
      this.projectsRepository.createProject(args),
    );
  }

  protected async readArgs(): Promise<CreateProjectParams> {
    const name = await input({ message: "Enter the project name" });

    const minLength = 2;

    const { jql } = await inquirer.prompt({
      type: "autocomplete",
      name: "jql",
      message: "Select a filter",
      emptyText: "No results",
      suffix: `(type ${minLength} chars)`,
      source: async (
        _: object,
        input: string,
      ): Promise<{ name: string; value: string }[]> => {
        if (!input || input.length < minLength) {
          return [];
        }

        const filters = await this.filtersRepository.getFilters(input);
        return filters.map((filter) => ({
          name: filter.name,
          value: filter.jql,
        }));
      },
    });

    return { name, jql };
  }
}
