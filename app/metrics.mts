import { confirm, select } from "@inquirer/prompts";
import ejs from "ejs";
import { LocalProjectsRepository } from "../data/local_projects_repository.mjs";
import { db } from "../data/db.mjs";
import { LocalIssuesRepository } from "../data/local_issues_repository.mjs";
import { cycleTimeMetrics } from "../domain/usecases/metrics/cycle_times.js";
import { differenceInMonths, startOfDay, subDays } from "date-fns";
import { promptInterval } from "./prompts/interval.mjs";
import { HierarchyLevel } from "../domain/entities.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { count, range } from "rambda";

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

  const { start, end } = await promptInterval(now, defaultEnd);

  const issues = await localIssuesRepository.getIssues(selectedProjectId);

  const { selectedIssues, outliers } = cycleTimeMetrics({
    issues,
    start,
    end,
    hierarchyLevel,
    excludeOutliers,
  });

  const scatterplot = {
    data: {
      datasets: [
        {
          label: "Cycle Times",
          data: selectedIssues.map((issue) => ({
            x: issue.completed?.toISOString(),
            y: issue.cycleTime,
          })),
          backgroundColor: "rgb(255, 99, 132)",
        },
      ],
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: differenceInMonths(end, start) > 3 ? "month" : "day",
        },
        position: "bottom",
        min: start,
        max: end,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const getHistogramData = () => {
    if (selectedIssues.length === 0) {
      return {
        data: [],
        buckets: [],
      };
    }

    const maxCycleTime = Math.round(selectedIssues[0].cycleTime);
    const buckets = range(0, maxCycleTime + 1);
    const countItems = (days: number) =>
      count((issue) => Math.round(issue.cycleTime) === days, selectedIssues);
    const data = buckets.map(countItems);
    return {
      data,
      buckets,
    };
  };

  const { data, buckets } = getHistogramData();

  const histogram = {
    data: {
      labels: buckets,
      datasets: [
        {
          label: "Frequency of items",
          data: data,
          backgroundColor: "rgb(255, 99, 132)",
        },
      ],
    },
  };

  const description = `${hierarchyLevel} cycle times ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

  const report = await ejs.renderFile("./app/templates/cycle_times.ejs.html", {
    project: selectedProject,
    selectedIssues,
    outliers,
    description,
    scatterplot,
    histogram,
  });

  const dir = path.join(
    process.cwd(),
    `./reports/${selectedProjectId}/${hierarchyLevel}`,
  );
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filename = path.join(dir, "index.html");
  writeFileSync(filename, report);

  console.log(`Report generated at ${filename}`);
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
