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

@Global()
@Module({
  providers: [
    LocalDatabase,
    LocalIssuesRepository,
    LocalProjectsRepository,
    JiraIssuesRepository,
    JiraFieldsRepository,
    JiraStatusRepository,
    JiraFiltersRepository,
    {
      provide: Version3Client,
      useValue: client,
    },
  ],
  exports: [
    LocalDatabase,
    LocalIssuesRepository,
    LocalProjectsRepository,
    JiraIssuesRepository,
    JiraFieldsRepository,
    JiraStatusRepository,
    JiraFiltersRepository,
  ],
})
export class DataModule {}
