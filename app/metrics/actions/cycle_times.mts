import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";
import { LocalIssuesRepository } from "../../../data/local_issues_repository.mjs";
import { confirm, select } from "@inquirer/prompts";
import { HierarchyLevel } from "../../../domain/entities.js";
import { startOfDay, subDays } from "date-fns";
import { promptInterval } from "../../prompts/interval.mjs";
import { cycleTimeMetrics } from "../../../domain/usecases/metrics/cycle_times.js";
import ejs from "ejs";
import path, { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { buildHistogram } from "../charts/histogram_builder.mjs";
import { buildScatterplot } from "../charts/scatterplot_builder.mjs";

@Injectable()
export class CycleTimesAction {
  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly issuesRepository: LocalIssuesRepository,
  ) {}

  async run() {
    const projects = await this.projectsRepository.getProjects();

    const selectedProjectId = await select({
      message: "Choose project",
      choices: projects.map((project) => ({
        name: project.name,
        value: project.id,
      })),
    });

    const selectedProject = projects.find(
      (project) => project.id === selectedProjectId,
    );

    const hierarchyLevel = await select({
      message: "Hierarchy level",
      choices: [
        { name: HierarchyLevel.Story, value: HierarchyLevel.Story },
        { name: HierarchyLevel.Epic, value: HierarchyLevel.Epic },
      ],
    });

    const excludeOutliers = await confirm({
      message: "Exclude outliers?",
      default: false,
    });

    const now = new Date();
    const defaultEnd = subDays(startOfDay(now), 30);

    const interval = await promptInterval(now, defaultEnd);

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
      "./app/templates/cycle_times.ejs.html",
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
      `./reports/${selectedProjectId}/${hierarchyLevel}`,
    );
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filename = path.join(dir, "index.html");
    writeFileSync(filename, report);

    console.log(`Report generated at ${filename}`);
  }
}
