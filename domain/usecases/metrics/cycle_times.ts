import { HierarchyLevel, StatusCategory } from "../../../domain/entities.js";
import { filter, pick, map, sortBy, reverse, pipe } from "rambda";
import { Issue } from "../../entities.js";

export const cycleTimeMetrics = (issues: Issue[], start: Date, end: Date) => {
  const storyCycleTimes = pipe(
    filter(
      (issue: Issue) =>
        issue.hierarchyLevel === HierarchyLevel.Story &&
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
