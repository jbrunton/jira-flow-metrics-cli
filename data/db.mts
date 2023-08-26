import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { Issue, Project } from "../domain/entities.js";

export type CachedIssue = Issue & {
  projectId: string;
};

export type DBData = {
  projects: Project[];
  issues: CachedIssue[];
};

const defaultData: DBData = { projects: [], issues: [] };
const adapter = new JSONFile<DBData>("./db.json");
export const db = new Low<DBData>(adapter, defaultData);
