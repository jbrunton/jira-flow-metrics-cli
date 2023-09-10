import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { HierarchyLevel, Issue, StatusCategory } from "#entities/index.js";
import { filter, range } from "rambda";
import { Interval, TimeUnit } from "#entities/intervals.mjs";

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
  const startFns: Record<TimeUnit, (date: Date) => Date> = {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth,
  };
  const endFns: Record<TimeUnit, (date: Date) => Date> = {
    day: endOfDay,
    week: endOfWeek,
    month: endOfMonth,
  };
  const diffFns: Record<TimeUnit, (leftDate: Date, rightDate: Date) => number> =
    {
      day: differenceInDays,
      week: differenceInWeeks,
      month: differenceInMonths,
    };
  const addFns: Record<TimeUnit, (date: Date, count: number) => Date> = {
    day: addDays,
    week: addWeeks,
    month: addMonths,
  };
  const start = startFns[timeUnit](interval.start);
  const end = endFns[timeUnit](interval.end);

  const intervals = range(0, diffFns[timeUnit](end, start) + 1).map(
    (index) => ({
      start: addFns[timeUnit](start, index),
      end: addFns[timeUnit](start, index + 1),
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
