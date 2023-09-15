import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "#data/local/projects_repository.mjs";
import { LocalIssuesRepository } from "#data/local/issues_repository.mjs";
import { HierarchyLevel, Issue } from "#entities/issues.ts";
import { cycleTimeMetrics } from "#usecases/metrics/cycle_times.js";
import ejs from "ejs";
import path, { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { buildHistogram } from "../charts/histogram.mjs";
import { buildScatterplot } from "../charts/scatterplot.mjs";
import { format } from "date-fns";
import { Interval } from "../../../domain/entities/intervals.mjs";
import { quantileSeq } from "mathjs";
import { formatDate, formatInterval, formatNumber } from "../../lib/format.mjs";

export type CycleTimesReportArgs = {
  selectedProjectId: string;
  interval: Interval;
  excludeOutliers: boolean;
  excludeUnstarted: boolean;
  hierarchyLevel: HierarchyLevel;
};

export type CycleTimesReportResult = {
  reportPath: string;
};

@Injectable()
export class CycleTimesReportAction {
  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly issuesRepository: LocalIssuesRepository,
  ) {}

  async run({
    selectedProjectId,
    excludeOutliers,
    excludeUnstarted,
    interval,
    hierarchyLevel,
  }: CycleTimesReportArgs): Promise<CycleTimesReportResult> {
    const projects = await this.projectsRepository.getProjects();

    const selectedProject = projects.find(
      (project) => project.id === selectedProjectId,
    );

    const issues = await this.issuesRepository.getIssues(selectedProjectId);

    const { selectedIssues, outliers } = cycleTimeMetrics({
      issues,
      interval,
      hierarchyLevel,
      excludeOutliers,
      excludeUnstarted,
    });

    const scatterplot = buildScatterplot(interval, selectedIssues);
    const histogram = buildHistogram(selectedIssues);
    const percentiles = getPercentiles(selectedIssues);

    const report = await ejs.renderFile(
      "./src/app/metrics/cycle_times/report.ejs.html",
      {
        project: selectedProject,
        selectedIssues,
        outliers,
        hierarchyLevel,
        interval,
        scatterplot,
        histogram,
        percentiles,
        linkTo: (issue: Issue) =>
          `${process.env.JIRA_HOST}/browse/${issue.key}`,
        format: {
          date: formatDate,
          number: formatNumber,
          interval: formatInterval,
        },
      },
    );

    const dir = join(
      process.cwd(),
      `./reports/${selectedProjectId}/${hierarchyLevel}/${format(
        interval.start,
        "yyyy-MM-dd",
      )}-${format(interval.end, "yyyy-MM-dd")}`,
    );
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const reportPath = path.join(dir, "index.html");
    writeFileSync(reportPath, report);

    return { reportPath };
  }
}

const getPercentiles = (
  issues: Issue[],
): { percentile: number; days: number }[] => {
  const cycleTimes = issues.map((issue) => issue.cycleTime);

  const quantiles =
    issues.length > 20
      ? [0.5, 0.7, 0.85, 0.95]
      : issues.length > 10
      ? [0.5, 0.7]
      : issues.length > 5
      ? [0.5]
      : [];

  const percentiles = quantiles.map((quantile) => {
    return {
      percentile: quantile * 100,
      days: Math.ceil(quantileSeq(cycleTimes, quantile) as number),
    };
  });

  return percentiles;
};
