import { Version3Client } from "jira.js";
import { Status, StatusCategory, StatusRepository } from "../domain/entities";
import { compact } from "lodash";

export class JiraStatusRepository implements StatusRepository {
  constructor(private readonly client: Version3Client) {}

  async getStatuses(): Promise<Status[]> {
    const jiraStatuses = await this.client.workflowStatuses.getStatuses();
    return compact(
      jiraStatuses.map((status) => {
        if (status.id === undefined) {
          console.warn(`Missing id for status ${status}`);
          return null;
        }

        const category = status.statusCategory?.name as StatusCategory;

        return {
          jiraId: status.id,
          name: status.name,
          category,
        };
      }),
    );
  }
}
