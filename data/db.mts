import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { Injectable } from "@nestjs/common";
import { Issue, Project } from "../domain/entities.js";
import { join } from "path";

export type CachedIssue = Issue & {
  projectId: string;
};

export type DBData = {
  projects: Project[];
  issues: CachedIssue[];
};

@Injectable()
export class LocalDatabase extends Low<DBData> {
  constructor() {
    const defaultData: DBData = { projects: [], issues: [] };
    const path = join(process.cwd(), "db.json");
    console.info("local database path:", path);
    const adapter = new JSONFile<DBData>(path);
    super(adapter, defaultData);
  }
}

export const db = new LocalDatabase();
