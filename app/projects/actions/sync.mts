import { Injectable } from "@nestjs/common";
import * as cliProgress from "cli-progress";
import {
  HierarchyLevel,
  Issue,
  Project,
  StatusCategory,
  isCompleted,
  isStarted,
} from "../../../domain/entities.js";
import { checkbox } from "@inquirer/prompts";
import { map, pipe, pluck, sort } from "rambda";
import { compareAsc, compareDesc } from "date-fns";
import {
  JiraIssueBuilder,
  getCycleTime,
} from "../../../data/issue_builder.mjs";
import { JiraFieldsRepository } from "../../../data/jira_fields_repository.js";
import { JiraStatusRepository } from "../../../data/jira_status_repository.js";
import { JiraIssuesRepository } from "../../../data/jira_issues_repository.js";
import { LocalIssuesRepository } from "../../../data/local_issues_repository.mjs";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";

@Injectable()
export class SyncProjectsAction {
  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly fieldsRepository: JiraFieldsRepository,
    private readonly statusRepository: JiraStatusRepository,
    private readonly issuesRepository: JiraIssuesRepository,
    private readonly localIssuesRepository: LocalIssuesRepository,
  ) {}

  async run() {
    const projects = await this.projectsRepository.getProjects();

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
      await this.syncProject(project);
    }
  }

  private async syncProject(project: Project) {
    console.info(`Syncing project ${project.name}`);

    const progressBar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic,
    );
    progressBar.start(1, 0);

    const [fields, statuses] = await Promise.all([
      this.fieldsRepository.getFields(),
      this.statusRepository.getStatuses(),
    ]);

    const builder = new JiraIssueBuilder(fields, statuses);

    const issues = await this.issuesRepository.search({
      jql: project.jql,
      onProgress: (pageIndex, totalPages) => {
        progressBar.setTotal(totalPages);
        progressBar.update(pageIndex);
      },
      builder,
    });
    progressBar.stop();

    const estimatedIssues = estimateEpicCycleTimes(issues);

    this.localIssuesRepository.storeIssues(project.id, estimatedIssues);

    await this.projectsRepository.setSyncedDate(project.id, new Date());

    console.info(
      `Synced project ${project.name} (${estimatedIssues.length} issues)`,
    );
  }
}

const estimateEpicCycleTimes = (issues: Issue[]): Issue[] => {
  return issues.map((issue) => {
    if (issue.hierarchyLevel !== HierarchyLevel.Epic) {
      return issue;
    }

    const children = issues.filter((child) => child.parentKey === issue.key);
    const startedChildren = children.filter(isStarted);
    const completedChildren = children.filter(isCompleted);

    const startedDates = pipe(
      pluck("started"),
      sort(compareAsc),
      map((x) => new Date(x)),
    )(startedChildren);
    const started = startedDates[0];

    const completedDates = pipe(
      pluck("completed"),
      sort(compareDesc),
      map((x) => new Date(x)),
    )(completedChildren);

    const completed =
      issue.statusCategory === StatusCategory.Done
        ? completedDates[0]
        : undefined;

    const cycleTime = getCycleTime(started, completed);

    const epic = {
      ...issue,
      started,
      completed,
      cycleTime,
    };

    return epic;
  });
};
