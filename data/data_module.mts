import { Global, Module } from "@nestjs/common";
import { LocalDatabase } from "./db.mjs";
import { JiraIssuesRepository } from "./jira_issues_repository.js";
import { LocalIssuesRepository } from "./local_issues_repository.mjs";
import { LocalProjectsRepository } from "./local_projects_repository.mjs";
import { JiraFieldsRepository } from "./jira_fields_repository.js";
import { JiraStatusRepository } from "./jira_status_repository.js";
import { JiraFiltersRepository } from "./jira_filters_repository.js";
import { Version3Client } from "jira.js";
import { client } from "./client.js";
import { LocalDashboardsRepository } from "./local_dashboards_repository.mjs";
import { JiraProjectsRepository } from "./jira_projects_repository.js";

@Global()
@Module({
  providers: [
    LocalDatabase,
    LocalIssuesRepository,
    LocalProjectsRepository,
    LocalDashboardsRepository,
    JiraIssuesRepository,
    JiraFieldsRepository,
    JiraStatusRepository,
    JiraFiltersRepository,
    JiraProjectsRepository,
    {
      provide: Version3Client,
      useValue: client,
    },
  ],
  exports: [
    LocalDatabase,
    LocalIssuesRepository,
    LocalProjectsRepository,
    LocalDashboardsRepository,
    JiraIssuesRepository,
    JiraFieldsRepository,
    JiraStatusRepository,
    JiraFiltersRepository,
    JiraProjectsRepository,
  ],
})
export class DataModule {}
