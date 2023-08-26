import { HierarchyLevel, StatusCategory } from "../../../domain/entities.js";
import { filter, pick, map, sortBy, reverse, pipe } from "rambda";
import { Issue } from "../../entities.js";

export type CycleTimeMetricsParams = {
  issues: Issue[];
  start: Date;
  end: Date;
  hierarchyLevel: HierarchyLevel;
};

export const cycleTimeMetrics = ({
  issues,
  start,
  end,
  hierarchyLevel,
}: CycleTimeMetricsParams) => {
  const storyCycleTimes = pipe(
    filter(
      (issue: Issue) =>
        issue.hierarchyLevel === hierarchyLevel &&
        issue.statusCategory === StatusCategory.Done &&
        issue.cycleTime !== undefined &&
        start <= issue.completed &&
        issue.completed < end,
    ),
    map(pick(["key", "summary", "started", "completed", "cycleTime"])),
    sortBy((issue: Issue) => issue.cycleTime),
    reverse<Issue>,
  )(issues);

  return storyCycleTimes;
};
