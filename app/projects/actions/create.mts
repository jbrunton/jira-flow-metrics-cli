import { Injectable } from "@nestjs/common";
import { JiraFiltersRepository } from "../../../data/jira_filters_repository.js";
import { input } from "@inquirer/prompts";
import inquirer from "inquirer";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";

@Injectable()
export class CreateProjectAction {
  constructor(
    private readonly filtersRepository: JiraFiltersRepository,
    private readonly projectsRepository: LocalProjectsRepository,
  ) {}

  async run() {
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

    await this.projectsRepository.createProject({ name, jql });
  }
}
