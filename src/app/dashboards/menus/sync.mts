import { Injectable } from "@nestjs/common";
import { MenuItem } from "../../lib/menus/types.js";
import { LocalDashboardsRepository } from "../../../data/local/dashboards_repository.mjs";
import { SyncProjectAction } from "../../projects/actions/sync.mjs";
import { LocalProjectsRepository } from "../../../data/local/projects_repository.mjs";
import { select } from "@inquirer/prompts";
import { CreateProjectAction } from "../../projects/actions/create.mjs";
import { run } from "../../lib/actions/run.js";
import {
  Dashboard,
  HierarchyLevel,
  Project,
} from "../../../domain/entities.js";
import { zip } from "rambda";
import padEnd from "lodash/padEnd.js";
import { CycleTimesReportAction } from "../../metrics/cycle_times/action.js";
import { TimeUnit, getRelativeInterval } from "../../../domain/intervals.mjs";
import ejs from "ejs";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

@Injectable()
export class SyncDashboardMenuItem implements MenuItem {
  readonly name = "Sync dashboard";

  constructor(
    private readonly dashboardsRepository: LocalDashboardsRepository,
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly syncProject: SyncProjectAction,
    private readonly createProject: CreateProjectAction,
    private readonly cycleTimesReport: CycleTimesReportAction,
  ) {}

  private async createProjects(dashboard: Dashboard) {
    const cachedProjects = await this.projectsRepository.getProjects();
    const dashboardProjects = dashboard.definition.projects;

    for (const dashboardProject of dashboardProjects) {
      if (
        !cachedProjects.find((project) => project.id === dashboardProject.id)
      ) {
        await run("Create project", () =>
          this.createProject.run(dashboardProject),
        );
      }
    }
  }

  private async syncProjects(dashboard: Dashboard) {
    const dashboardProjects = dashboard.definition.projects;

    const actionNames = dashboardProjects.map(
      (project) => `Syncing project ${project.name}`,
    );
    const maxLength = Math.max(...actionNames.map((name) => name.length));

    for (const [project, name] of zip(dashboardProjects, actionNames)) {
      await run(padEnd(name, maxLength + 1), (onUpdate) =>
        this.syncProject.run({ project }, onUpdate),
      );
    }
  }

  private async createMetrics(
    dashboard: Dashboard,
  ): Promise<{ reportPath: string }> {
    const dashboardProjects = dashboard.definition.projects;
    const now = new Date();

    const reports: { project: Project; name: string; path: string }[] = [];

    for (const project of dashboardProjects) {
      await run(`Generating story cycle times report for ${project.name}`, () =>
        this.cycleTimesReport.run({
          selectedProjectId: project.id,
          hierarchyLevel: HierarchyLevel.Story,
          interval: getRelativeInterval(now, 30, TimeUnit.Day),
          excludeOutliers: false,
          excludeUnstarted: true,
        }),
      ).then(({ reportPath }) => {
        reports.push({ project, name: "story cycle times", path: reportPath });
      });

      await run(`Generating epic cycle times report for ${project.name}`, () =>
        this.cycleTimesReport.run({
          selectedProjectId: project.id,
          hierarchyLevel: HierarchyLevel.Epic,
          interval: getRelativeInterval(now, 3, TimeUnit.Month),
          excludeOutliers: false,
          excludeUnstarted: true,
        }),
      ).then(({ reportPath }) => {
        reports.push({ project, name: "epic cycle times", path: reportPath });
      });
    }

    const report = await ejs.renderFile("./app/dashboards/report.ejs.html", {
      dashboard,
      reports,
    });

    const dir = join(process.cwd(), `./reports/${dashboard.id}/`);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const reportPath = join(dir, "index.html");
    writeFileSync(reportPath, report);

    return { reportPath };
  }

  async run(): Promise<void> {
    const { dashboardId } = await this.readArgs();

    const dashboards = await this.dashboardsRepository.getDashboards();
    const dashboard = dashboards.find(
      (dashboard) => dashboard.id === dashboardId,
    );

    await this.createProjects(dashboard);
    await this.syncProjects(dashboard);
    const { reportPath } = await this.createMetrics(dashboard);
    console.info(`Report generated at ${reportPath}`);
  }

  protected async readArgs(): Promise<{ dashboardId: string }> {
    const dashboards = await this.dashboardsRepository.getDashboards();

    const dashboardId = await select({
      message: "Choose dashboard",
      choices: dashboards.map((dashboard) => ({
        name: dashboard.definition.name,
        value: dashboard.id,
      })),
    });

    return { dashboardId };
  }
}
