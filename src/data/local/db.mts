import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { Injectable } from "@nestjs/common";
import { Dashboard, Issue, Project } from "../../domain/entities.js";
import { join } from "path";
import { URL } from "url";

export type CachedIssue = Issue & {
  projectId: string;
};

export type DBData = {
  projects: Project[];
  dashboards: Dashboard[];
  issues: CachedIssue[];
};

@Injectable()
export class LocalDatabase extends Low<DBData> {
  constructor() {
    const defaultData: DBData = { projects: [], dashboards: [], issues: [] };
    const host = new URL(process.env.JIRA_HOST).host;
    const path = join(process.cwd(), "cache", `${host}.json`);
    const adapter = new JSONFile<DBData>(path);
    super(adapter, defaultData);
  }
}

export const db = new LocalDatabase();