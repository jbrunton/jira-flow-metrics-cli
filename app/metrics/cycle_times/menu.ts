import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";
import { confirm, select } from "@inquirer/prompts";
import { HierarchyLevel } from "../../../domain/entities.js";
import { startOfDay, subDays } from "date-fns";
import { promptInterval } from "../../lib/prompts/interval.mjs";
import { MenuItem } from "../../lib/menu_item.js";
import {
  CycleTimesReportAction,
  CycleTimesReportArgs,
  CycleTimesReportResult,
} from "./action.js";
import { logger } from "../../lib/action_logger.js";

@Injectable()
export class CycleTimesMenuItem extends MenuItem<
  CycleTimesReportArgs,
  CycleTimesReportResult
> {
  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    action: CycleTimesReportAction,
  ) {
    super(action);
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

    const now = new Date();
    const defaultStart = subDays(startOfDay(now), 30);
    const interval = await promptInterval(defaultStart, now);

    return {
      selectedProjectId,
      excludeOutliers,
      hierarchyLevel,
      interval,
    };
  }

  onSuccess({ reportPath }: CycleTimesReportResult): void {
    logger.info(`Report path: ${reportPath}`);
  }
}
