import * as cliProgress from "cli-progress";
import { JiraIssuesRepository } from "./data/jira_issues_repository";
import { client } from "./data/client";
import { IssueBuilder } from "./data/issue_builder";
import { JiraFieldsRepository } from "./data/jira_fields_repository";
import { JiraStatusRepository } from "./data/jira_status_repository";
import { HierarchyLevel, StatusCategory } from "./domain/entities";
import { chain, pick, min } from "lodash";

const main = async () => {
  const jql = "filter='Filter for MET board'";

  const issuesRepository = new JiraIssuesRepository(client);
  const fieldsRepository = new JiraFieldsRepository(client);
  const statusRepository = new JiraStatusRepository(client);

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );
  progressBar.start(1, 0);

  const [fields, statuses] = await Promise.all([
    fieldsRepository.getFields(),
    statusRepository.getStatuses(),
  ]);

  const builder = new IssueBuilder(fields, statuses);

  const issues = await issuesRepository.search({
    jql,
    onProgress: (pageIndex, totalPages) => {
      progressBar.setTotal(totalPages);
      progressBar.update(pageIndex);
    },
    builder,
  });
  progressBar.stop();

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

  console.table(storyCycleTimes);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
