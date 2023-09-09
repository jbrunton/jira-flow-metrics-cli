import { differenceInMonths } from "date-fns";
import { Issue } from "#entities/index.js";
import { Interval } from "../../../domain/entities/intervals.mjs";

export const buildScatterplot = ({ start, end }: Interval, issues: Issue[]) => {
  const scatterplot = {
    data: {
      datasets: [
        {
          label: "Cycle Times",
          data: issues.map((issue) => ({
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

  return scatterplot;
};
