import { count, range } from "rambda";
import { Issue } from "#entities/issues.ts";
//import { quantileSeq } from "mathjs";

export type Histogram = {
  data: {
    labels: number[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  // percentiles: [number, number][],
};

export const buildHistogram = (issues: Issue[]): Histogram => {
  if (issues.length === 0) {
    return {
      data: {
        labels: [],
        datasets: [],
      },
      //percentiles: [],
    };
  }

  const cycleTimes = issues.map((issue) => issue.cycleTime);

  const maxCycleTime = Math.ceil(cycleTimes[0]);
  const buckets = range(0, maxCycleTime + 1);
  const countItems = (days: number) =>
    count((cycleTime) => Math.ceil(cycleTime) === days, cycleTimes);
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
    //percentiles,
  };

  return histogram;
};
