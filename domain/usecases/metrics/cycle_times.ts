import { HierarchyLevel, StatusCategory } from "../../../domain/entities";
import { chain, pick } from "lodash";
import { Issue } from "../../entities";

export const cycleTimeMetrics = (issues: Issue[]) => {
  const storyCycleTimes = chain(issues)
    .filter(
      (issue) =>
        issue.hierarchyLevel === HierarchyLevel.Story &&
        issue.statusCategory === StatusCategory.Done &&
        issue.cycleTime !== undefined,
    )
    .map((issue) =>
      pick(issue, ["key", "summary", "started", "completed", "cycleTime"]),
    )
    .sortBy("cycleTime")
    .reverse()
    .take(5)
    .value();

  return storyCycleTimes;
};
