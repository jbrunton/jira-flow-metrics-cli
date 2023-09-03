import { HierarchyLevel, StatusCategory } from "../../../domain/entities.js";
import { filter, sortBy, reverse, pipe } from "rambda";
import { Issue } from "../../entities.js";
import { excludeOutliersFromSeq } from "../../../app/outliers.js";
import { Interval } from "../../intervals.mjs";

export type CycleTimeMetricsParams = {
  issues: Issue[];
  interval: Interval;
  hierarchyLevel: HierarchyLevel;
  excludeOutliers: boolean;
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
}: CycleTimeMetricsParams): CycleTimeMetricsResult => {
  const sortedIssues = pipe(
    filter(
      (issue: Issue) =>
        issue.hierarchyLevel === hierarchyLevel &&
        issue.statusCategory === StatusCategory.Done &&
        issue.cycleTime !== undefined &&
        start <= issue.completed &&
        issue.completed < end,
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
