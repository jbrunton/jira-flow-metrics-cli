import * as cliProgress from "cli-progress";
import { JiraIssuesRepository } from "./data/jira_issues_repository";
import { client } from "./data/client";
import { IssueBuilder } from "./data/issue_builder";
import { JiraFieldsRepository } from "./data/jira_fields_repository";
import { JiraStatusRepository } from "./data/jira_status_repository";
import { cycleTimeMetrics } from "./domain/usecases/metrics/cycle_times";
import { select } from "@inquirer/prompts";

const cycleTimeMetricsAction = async () => {
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

  const storyCycleTimes = cycleTimeMetrics(issues);

  console.table(storyCycleTimes);
};

const main = async () => {
  const answer = await select({
    message: "Select an option",
    choices: [
      {
        name: "Metrics",
        value: "metrics",
        description: "Cycle time metrics for longest stories",
      },
      {
        name: "Quit",
        value: "quit",
        description: "Exit the program",
      },
    ],
  });

  if (answer === "metrics") {
    await cycleTimeMetricsAction();
  }

  if (answer !== "quit") {
    await main();
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
