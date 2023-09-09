import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "#data/local/projects_repository.mjs";
import { confirm, select } from "@inquirer/prompts";
import { HierarchyLevel } from "#entities/index.js";
import { startOfDay, subDays } from "date-fns";
import { promptInterval } from "../../lib/prompts/interval.mjs";
import { CycleTimesReportAction, CycleTimesReportArgs } from "./action.js";
import { logger } from "../../lib/actions/logger.js";
import { run } from "../../lib/actions/run.js";
import { MenuItem } from "../../lib/menus/types.js";

@Injectable()
export class CycleTimesMenuItem implements MenuItem {
  readonly name = "Cycle times";

  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    private readonly action: CycleTimesReportAction,
  ) {}

  async run(): Promise<void> {
    const args = await this.readArgs();
    const { reportPath } = await run("Generating cycle time report", () =>
      this.action.run(args),
    );
    logger.info(`Report path: ${reportPath}`);
  }

  protected async readArgs(): Promise<CycleTimesReportArgs> {
    const projects = await this.projectsRepository.getProjects();

    const selectedProjectId = await select({
      message: "Choose project",
      choices: projects.map((project) => ({
        name: project.name,
        value: project.id,
      })),
    });

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

    const excludeUnstarted = await confirm({
      message: "Exclude issues which were never moved to in progress?",
      default: true,
    });

    const now = new Date();
    const defaultStart = subDays(startOfDay(now), 30);
    const interval = await promptInterval(defaultStart, now);

    return {
      selectedProjectId,
      excludeOutliers,
      excludeUnstarted,
      hierarchyLevel,
      interval,
    };
  }
}
