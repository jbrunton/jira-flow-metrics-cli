import { select } from "@inquirer/prompts";
import { LocalProjectsRepository } from "../data/local_projects_repository.mjs";
import { db } from "../data/db.mjs";
import { LocalIssuesRepository } from "../data/local_issues_repository.mjs";
import { cycleTimeMetrics } from "../domain/usecases/metrics/cycle_times.js";
import { startOfDay, subDays } from "date-fns";
import { promptInterval } from "./prompts/interval.mjs";
import { HierarchyLevel } from "../domain/entities.js";

const projectsRepository = new LocalProjectsRepository(db);
const localIssuesRepository = new LocalIssuesRepository(db);

const cycleTimesAction = async () => {
  const projects = await projectsRepository.getProjects();

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

  const now = new Date();
  const defaultEnd = subDays(startOfDay(now), 30);

  const { start, end } = await promptInterval(now, defaultEnd);

  const issues = await localIssuesRepository.getIssues(selectedProjectId);

  const storyCycleTimes = cycleTimeMetrics({
    issues,
    start,
    end,
    hierarchyLevel,
  });

  console.table(storyCycleTimes);
};

export const metricsMenuAction = async (): Promise<void> => {
  const answer = await select({
    message: "Metrics >",
    choices: [
      {
        name: "Cycle times",
        value: "cycle_times",
      },
      // {
      //   name: "Epic cycle times",
      //   value: "epic_cycle_times",
      // },
      {
        name: "Back",
        value: "back",
        description: "Cancel",
      },
    ],
  });

  switch (answer) {
    case "cycle_times":
      return cycleTimesAction();
    // case "epic_cycle_times":
    //   return createProjectAction();
    default:
      return Promise.resolve();
  }
};
