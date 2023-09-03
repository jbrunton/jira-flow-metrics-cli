import { Injectable } from "@nestjs/common";
import { MenuItem } from "../../lib/menus/types.js";
import { LocalDashboardsRepository } from "../../../data/local_dashboards_repository.mjs";
import { SyncProjectAction } from "../../projects/actions/sync.mjs";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";
import { select } from "@inquirer/prompts";
import { CreateProjectAction } from "../../projects/actions/create.mjs";
import { run } from "../../lib/actions/run.js";
import { Dashboard, HierarchyLevel } from "../../../domain/entities.js";
import { zip } from "rambda";
import padEnd from "lodash/padEnd.js";
import { CycleTimesReportAction } from "../../metrics/cycle_times/action.js";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { logger } from "../../lib/actions/logger.js";

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

  private async createMetrics(dashboard: Dashboard) {
    const dashboardProjects = dashboard.definition.projects;
    const now = new Date();

    for (const project of dashboardProjects) {
      const start = subDays(startOfDay(now), 30);
      const end = endOfDay(now);
      await run(`Generating story cycle times report for ${project.name}`, () =>
        this.cycleTimesReport.run({
          selectedProjectId: project.id,
          hierarchyLevel: HierarchyLevel.Story,
          interval: { start, end },
          excludeOutliers: false,
        }),
      ).then(({ reportPath }) => logger.info(`Report: ${reportPath}`));
      await run(`Generating epic cycle times report for ${project.name}`, () =>
        this.cycleTimesReport.run({
          selectedProjectId: project.id,
          hierarchyLevel: HierarchyLevel.Epic,
          interval: { start, end },
          excludeOutliers: false,
        }),
      ).then(({ reportPath }) => logger.info(`Report: ${reportPath}`));
    }
  }

  async run(): Promise<void> {
    const { dashboardId } = await this.readArgs();

    const dashboards = await this.dashboardsRepository.getDashboards();
    const dashboard = dashboards.find(
      (dashboard) => dashboard.id === dashboardId,
    );

    await this.createProjects(dashboard);
    await this.syncProjects(dashboard);
    await this.createMetrics(dashboard);
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
