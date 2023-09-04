import { count, range } from "rambda";
import { Issue } from "../../../domain/entities.js";

export const buildHistogram = (issues: Issue[]) => {
  if (issues.length === 0) {
    return {
      data: [],
      buckets: [],
    };
  }

  const maxCycleTime = Math.round(issues[0].cycleTime);
  const buckets = range(0, maxCycleTime + 1);
  const countItems = (days: number) =>
    count((issue) => Math.ceil(issue.cycleTime) === days, issues);
  const data = buckets.map(countItems);

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

  return histogram;
};
