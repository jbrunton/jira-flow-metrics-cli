import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";
import { select } from "@inquirer/prompts";
import { HierarchyLevel } from "../../../domain/entities.js";
import { startOfDay, subDays } from "date-fns";
import { promptInterval } from "../../lib/prompts/interval.mjs";
import { promptTimeUnit } from "../../lib/prompts/time_unit.mjs";
import { MenuItem } from "../../lib/menu_item.js";
import {
  ThroughputReportAction,
  ThroughputReportActionArgs,
  ThroughputReportActionResult,
} from "./action.js";
import { logger } from "../../lib/action_logger.js";

@Injectable()
export class ThroughputMenuItem extends MenuItem<
  ThroughputReportActionArgs,
  ThroughputReportActionResult
> {
  constructor(
    private readonly projectsRepository: LocalProjectsRepository,
    action: ThroughputReportAction,
  ) {
    super(action);
  }

  protected async readArgs(): Promise<ThroughputReportActionArgs> {
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

    const timeUnit = await promptTimeUnit();

    const now = new Date();
    const defaultStart = subDays(startOfDay(now), 30);
    const interval = await promptInterval(defaultStart, now);

    return {
      selectedProjectId,
      interval,
      hierarchyLevel,
      timeUnit,
    };
  }

  onSuccess({ reportPath }: ThroughputReportActionResult): void {
    logger.info(`Report path: ${reportPath}`);
  }
}
