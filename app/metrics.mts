import { select } from "@inquirer/prompts";
import { LocalProjectsRepository } from "../data/local_projects_repository.mjs";
import { db } from "../data/db.mjs";
import { LocalIssuesRepository } from "../data/local_issues_repository.mjs";
import { cycleTimeMetrics } from "../domain/usecases/metrics/cycle_times.js";

const projectsRepository = new LocalProjectsRepository(db);
const localIssuesRepository = new LocalIssuesRepository(db);

const storyCycleTimesAction = async () => {
  const projects = await projectsRepository.getProjects();

  const selectedProjectId = await select({
    message: "Choose project",
    choices: projects.map((project) => ({
      name: project.name,
      value: project.id,
    })),
  });

  const issues = await localIssuesRepository.getIssues(selectedProjectId);
  const storyCycleTimes = cycleTimeMetrics(issues);
  console.table(storyCycleTimes);
};

export const metricsMenuAction = async (): Promise<void> => {
  const answer = await select({
    message: "Metrics >",
    choices: [
      {
        name: "Story cycle times",
        value: "story_cycle_times",
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
    case "story_cycle_times":
      return storyCycleTimesAction();
    // case "epic_cycle_times":
    //   return createProjectAction();
    default:
      return Promise.resolve();
  }
};
