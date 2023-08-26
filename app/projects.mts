import * as cliProgress from "cli-progress";
import { input, select, checkbox } from "@inquirer/prompts";
import { JiraFiltersRepository } from "../data/jira_filters_repository.js";
import { client } from "../data/client.js";
import inquirer from "inquirer";
import { LocalProjectsRepository } from "../data/local_projects_repository.mjs";
import { db } from "../data/db.mjs";
import { Project } from "../domain/entities.js";
import { JiraIssuesRepository } from "../data/jira_issues_repository.js";
import { JiraFieldsRepository } from "../data/jira_fields_repository.js";
import { JiraStatusRepository } from "../data/jira_status_repository.js";
import { IssueBuilder } from "../data/issue_builder.js";
import { LocalIssuesRepository } from "../data/local_issues_repository.mjs";

const filtersRepository = new JiraFiltersRepository(client);
const projectsRepository = new LocalProjectsRepository(db);
const localIssuesRepository = new LocalIssuesRepository(db);
const issuesRepository = new JiraIssuesRepository(client);
const fieldsRepository = new JiraFieldsRepository(client);
const statusRepository = new JiraStatusRepository(client);

const syncProjectAction = async (project: Project) => {
  console.info(`Syncing project ${project.name}`);

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );
  progressBar.start(1, 0);

  const [fields, statuses] = await Promise.all([
    fieldsRepository.getFields(),
    statusRepository.getStatuses(),
  ]);

  const builder = new IssueBuilder(fields, statuses);

  const issues = await issuesRepository.search({
    jql: project.jql,
    onProgress: (pageIndex, totalPages) => {
      progressBar.setTotal(totalPages);
      progressBar.update(pageIndex);
    },
    builder,
  });
  progressBar.stop();

  localIssuesRepository.storeIssues(project.id, issues);

  await projectsRepository.setSyncedDate(project.id, new Date());

  console.info(`Synced project ${project.name} (${issues.length} issues)`);
};

const createProjectAction = async () => {
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

      const filters = await filtersRepository.getFilters(input);
      return filters.map((filter) => ({
        name: filter.name,
        value: filter.jql,
      }));
    },
  });

  await projectsRepository.createProject({ name, jql });
};

const listProjectsAction = async () => {
  const projects = await projectsRepository.getProjects();
  console.table(projects);
};

const syncProjectsAction = async () => {
  const projects = await projectsRepository.getProjects();

  const selectedProjectIds = await checkbox({
    message: "Choose projects",
    choices: projects.map((project) => ({
      name: project.name,
      value: project.id,
      checked: true,
    })),
  });

  for (const projectId of selectedProjectIds) {
    const project = projects.find((project) => project.id === projectId);
    await syncProjectAction(project);
  }
};

export const projectsMenuAction = async (): Promise<void> => {
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
      return listProjectsAction();
    case "create_project":
      return createProjectAction();
    case "sync_projects":
      return syncProjectsAction();
    default:
      return Promise.resolve();
  }
};
