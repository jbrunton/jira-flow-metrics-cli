import { HierarchyLevel, StatusCategory, Issue } from "#entities/index.js";
import { filter, sortBy, reverse, pipe } from "rambda";
import { excludeOutliersFromSeq } from "./outliers.ts";
import { Interval } from "#entities/intervals.mjs";

export type CycleTimeMetricsParams = {
  issues: Issue[];
  interval: Interval;
  hierarchyLevel: HierarchyLevel;
  excludeOutliers: boolean;
  excludeUnstarted: boolean;
};

export type CycleTimeMetricsResult = {
  selectedIssues: Issue[];
  outliers: Issue[];
};

export const cycleTimeMetrics = ({
  issues,
  interval: { start, end },
  hierarchyLevel,
  excludeOutliers,
  excludeUnstarted,
}: CycleTimeMetricsParams): CycleTimeMetricsResult => {
  const sortedIssues = pipe(
    filter(
      (issue: Issue) =>
        issue.hierarchyLevel === hierarchyLevel &&
        issue.statusCategory === StatusCategory.Done &&
        issue.cycleTime !== undefined &&
        start <= issue.completed &&
        issue.completed < end &&
        (!excludeUnstarted || issue.started !== undefined),
    ),
    sortBy((issue: Issue) => issue.cycleTime),
    reverse<Issue>,
  )(issues);

  if (!excludeOutliers) {
    return {
      selectedIssues: sortedIssues,
      outliers: [],
    };
  }

  const selectedIssues = excludeOutliersFromSeq(
    sortedIssues,
    (issue) => issue.cycleTime,
  );
  const outliers = sortedIssues.filter(
    (issue) => !selectedIssues.includes(issue),
  );

  return {
    selectedIssues,
    outliers,
  };
};
