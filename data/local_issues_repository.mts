import { Issue } from "../domain/entities.js";
import { Low } from "lowdb";
import { omit } from "rambda";
import { DBData } from "./db.mjs";

export class LocalIssuesRepository {
  constructor(private readonly db: Low<DBData>) {}

  async getIssues(projectId: string): Promise<Issue[]> {
    return this.db.data.issues
      .filter((issue) => issue.projectId === projectId)
      .map((issue) => omit(["projectId"], issue));
  }

  async storeIssues(projectId: string, issues: Issue[]): Promise<void> {
    await this.clearCache(projectId);

    const cachedIssues = issues.map((issue) => ({ ...issue, projectId }));
    this.db.data.issues.push(...cachedIssues);

    await this.db.write();
  }

  async clearCache(projectId: string): Promise<void> {
    this.db.data.issues = this.db.data.issues.filter(
      (issue) => issue.projectId !== projectId,
    );
    await this.db.write();
  }
}
