import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";
import { LocalIssuesRepository } from "../../../data/local_issues_repository.mjs";
import { HierarchyLevel, Interval } from "../../../domain/entities.js";
import { cycleTimeMetrics } from "../../../domain/usecases/metrics/cycle_times.js";
import ejs from "ejs";
import path, { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { buildHistogram } from "../charts/histogram.mjs";
import { buildScatterplot } from "../charts/scatterplot.mjs";
import { format } from "date-fns";

export type CycleTimesReportArgs = {
  selectedProjectId: string;
  interval: Interval;
  excludeOutliers: boolean;
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
    });

    const scatterplot = buildScatterplot(interval, selectedIssues);
    const histogram = buildHistogram(selectedIssues);

    const description = `${hierarchyLevel} cycle times ${interval.start.toLocaleDateString()} - ${interval.end.toLocaleDateString()}`;

    const report = await ejs.renderFile(
      "./app/metrics/cycle_times/report.ejs.html",
      {
        project: selectedProject,
        selectedIssues,
        outliers,
        description,
        scatterplot,
        histogram,
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
