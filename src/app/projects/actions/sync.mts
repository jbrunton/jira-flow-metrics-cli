import { Injectable } from "@nestjs/common";
import {
  HierarchyLevel,
  Issue,
  StatusCategory,
  isCompleted,
  isStarted,
} from "#entities/issues.ts";
import { map, pipe, pluck, sort } from "rambda";
import { compareAsc, compareDesc } from "date-fns";
import { JiraIssueBuilder, getCycleTime } from "#data/jira/issue_builder.mjs";
import { JiraFieldsRepository } from "#data/jira/fields_repository.js";
import { JiraStatusRepository } from "#data/jira/status_repository.js";
import { JiraIssuesRepository } from "#data/jira/issues_repository.js";
import { LocalIssuesRepository } from "#data/local/issues_repository.mjs";
import { LocalProjectsRepository } from "#data/local/projects_repository.mjs";
import padStart from "lodash/padStart.js";
import chalk from "chalk";
import { Project } from "#entities/projects.mjs";

export type SyncProjectActionArgs = {
  project: Project;
};

@Injectable()
export class SyncProjectAction {
  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly fieldsRepository: JiraFieldsRepository,
    private readonly statusRepository: JiraStatusRepository,
    private readonly issuesRepository: JiraIssuesRepository,
    private readonly localIssuesRepository: LocalIssuesRepository,
  ) {}

  async run({ project }: SyncProjectActionArgs, onUpdate) {
    await this.syncProject(project, onUpdate);
  }

  private async syncProject(
    project: Project,
    onUpdate: (text: string) => void,
  ) {
    const [fields, statuses] = await Promise.all([
      this.fieldsRepository.getFields(),
      this.statusRepository.getStatuses(),
    ]);

    const builder = new JiraIssueBuilder(fields, statuses);

    const issues = await this.issuesRepository.search({
      jql: project.jql,
      onProgress: (pageIndex, totalPages) => {
        const progress = Math.round((100 * pageIndex) / totalPages);
        onUpdate(chalk.bold(padStart(`${progress}%`, 4)));
      },
      builder,
    });
    onUpdate(`${chalk.bold("100%")}  ${issues.length} issues synced`);

    const estimatedIssues = estimateEpicCycleTimes(issues);

    this.localIssuesRepository.storeIssues(project.id, estimatedIssues);

    await this.projectsRepository.setSyncedDate(project.id, new Date());
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
