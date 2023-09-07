import { Version3Client } from "jira.js";
import { JiraProject } from "../domain/entities.js";
import { reject, isNil } from "rambda";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JiraProjectsRepository {
  constructor(private readonly client: Version3Client) {}

  async getProjects(query: string): Promise<JiraProject[]> {
    const firstPage = await this.client.projects.searchProjects({
      query,
      expand: "jql",
    });
    return reject(isNil)(
      firstPage.values.map((project) => {
        return {
          name: project.name,
          key: project.key,
        };
      }),
    );
  }
}
