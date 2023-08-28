import { Issue } from "../domain/entities.js";
import { omit } from "rambda";
import { LocalDatabase } from "./db.mjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalIssuesRepository {
  constructor(private readonly db: LocalDatabase) {}

  async getIssues(projectId: string): Promise<Issue[]> {
    return this.db.data.issues
      .filter((issue) => issue.projectId === projectId)
      .map((issue) => omit(["projectId"], issue))
      .map((issue) => ({
        ...issue,
        started: issue.started ? new Date(issue.started) : undefined,
        completed: issue.completed ? new Date(issue.completed) : undefined,
      }));
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
