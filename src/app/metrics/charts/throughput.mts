import { TimeUnit } from "../../../domain/entities/intervals.mjs";
import { ThroughputResult } from "#usecases/metrics/throughput.js";

export const buildThroughputChart = (
  timeUnit: TimeUnit,
  result: ThroughputResult,
) => {
  const labels = result.map(({ date }) => date.toISOString());

  const data = {
    labels,
    datasets: [
      {
        label: "Throughput",
        data: result.map(({ count }) => count),
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const scales = {
    x: {
      type: "time",
      time: {
        unit: timeUnit,
      },
      position: "bottom",
    },
    y: {
      beginAtZero: true,
    },
  };

  return { data, scales };
};
