import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";
import { LocalIssuesRepository } from "../../../data/local_issues_repository.mjs";
import { HierarchyLevel } from "../../../domain/entities.js";
import ejs from "ejs";
import path, { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { calculateThroughput } from "../../../domain/usecases/metrics/throughput.js";
import { buildThroughputChart } from "../charts/throughput.mjs";
import { Interval, TimeUnit } from "../../../domain/intervals.mjs";

export type ThroughputReportActionArgs = {
  selectedProjectId: string;
  interval: Interval;
  hierarchyLevel: HierarchyLevel;
  timeUnit: TimeUnit;
};

export type ThroughputReportActionResult = {
  reportPath: string;
};

@Injectable()
export class ThroughputReportAction {
  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly issuesRepository: LocalIssuesRepository,
  ) {}

  async run({
    selectedProjectId,
    interval,
    hierarchyLevel,
    timeUnit,
  }: ThroughputReportActionArgs): Promise<ThroughputReportActionResult> {
    const projects = await this.projectsRepository.getProjects();

    const selectedProject = projects.find(
      (project) => project.id === selectedProjectId,
    );

    const issues = await this.issuesRepository.getIssues(selectedProjectId);

    const throughputData = calculateThroughput({
      issues,
      interval,
      hierarchyLevel,
      timeUnit,
    });

    const description = `${hierarchyLevel} throughput ${interval.start.toLocaleDateString()} - ${interval.end.toLocaleDateString()}`;

    const throughputChart = buildThroughputChart(timeUnit, throughputData);

    const report = await ejs.renderFile(
      "./app/metrics/throughput/report.ejs.html",
      {
        project: selectedProject,
        description,
        throughputData,
        throughputChart,
      },
    );

    const dir = join(
      process.cwd(),
      `./reports/${selectedProjectId}/${hierarchyLevel}`,
    );
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const reportPath = path.join(dir, "throughput.html");
    writeFileSync(reportPath, report);

    return { reportPath };
  }
}
