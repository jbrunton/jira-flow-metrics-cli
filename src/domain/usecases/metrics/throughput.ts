import { HierarchyLevel, Issue, StatusCategory } from "#entities/index.js";
import { filter, range } from "rambda";
import {
  Interval,
  TimeUnit,
  addTime,
  difference,
  endOf,
  startOf,
} from "#entities/intervals.mjs";

export type CalculateThroughputParams = {
  issues: Issue[];
  interval: Interval;
  hierarchyLevel: HierarchyLevel;
  timeUnit: TimeUnit;
};

export type ThroughputResult = { date: Date; count: number; issues: Issue[] }[];

export const calculateThroughput = ({
  issues,
  interval,
  hierarchyLevel,
  timeUnit,
}: CalculateThroughputParams): ThroughputResult => {
  const start = startOf(interval.start, timeUnit);
  const end = endOf(interval.end, timeUnit);

  const intervals = range(0, difference(end, start, timeUnit) + 1).map(
    (index) => ({
      start: addTime(start, index, timeUnit),
      end: addTime(start, index + 1, timeUnit),
    }),
  );

  const result = intervals.map(({ start, end }) => {
    const items = filter(
      (issue: Issue) =>
        issue.hierarchyLevel === hierarchyLevel &&
        issue.statusCategory === StatusCategory.Done &&
        issue.cycleTime !== undefined &&
        start <= issue.completed &&
        issue.completed < end,
      issues,
    );
    return { date: start, count: items.length, issues: items };
  });

  return result;
};
