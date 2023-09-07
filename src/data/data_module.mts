import { Global, Module } from "@nestjs/common";
import { LocalDatabase } from "./local/db.mjs";
import { JiraIssuesRepository } from "./jira/issues_repository.js";
import { LocalIssuesRepository } from "./local/issues_repository.mjs";
import { LocalProjectsRepository } from "./local/projects_repository.mjs";
import { JiraFieldsRepository } from "./jira/fields_repository.js";
import { JiraStatusRepository } from "./jira/status_repository.js";
import { JiraFiltersRepository } from "./jira/filters_repository.js";
import { Version3Client } from "jira.js";
import { client } from "./jira/client.js";
import { LocalDashboardsRepository } from "./local/dashboards_repository.mjs";
import { JiraProjectsRepository } from "./jira/projects_repository.js";

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
