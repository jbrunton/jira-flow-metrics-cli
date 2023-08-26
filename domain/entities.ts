import { Version3Models } from "jira.js";

export enum StatusCategory {
  ToDo = "To Do",
  InProgress = "In Progress",
  Done = "Done",
}

export enum HierarchyLevel {
  Story = "Story",
  Epic = "Epic",
}

export type Status = {
  jiraId: string;
  name?: string;
  category: StatusCategory;
};

export type Field = {
  jiraId: string;
  name?: string;
};

export type Filter = {
  name: string;
  jql: string;
};

export type TransitionStatus = {
  name?: string;
  category: StatusCategory;
};

export type Transition = {
  date: Date;
  fromStatus: TransitionStatus;
  toStatus: TransitionStatus;
};

export type SerializedTransition = Omit<Transition, "date"> & {
  date: string;
};

export type Issue = {
  key: string;
  summary: string;
  issueType?: string;
  hierarchyLevel: HierarchyLevel;
  status?: string;
  statusCategory: StatusCategory;
  started?: Date;
  completed?: Date;
  cycleTime?: number;
  transitions: Transition[];
};

export interface IssueBuilder {
  build(json: Version3Models.Issue): Issue;
}

export type SearchParams = {
  jql: string;
  onProgress: (pageIndex: number, total: number) => void;
  builder: IssueBuilder;
};

export interface IssuesRepository {
  search({ jql, onProgress }: SearchParams): Promise<Issue[]>;
}

export interface StatusRepository {
  getStatuses(): Promise<Status[]>;
}

export interface FieldsRepository {
  getFields(): Promise<Field[]>;
}

export interface FiltersRepository {
  getFilters(): Promise<Filter[]>;
}

export type Project = {
  id: string;
  name: string;
  jql: string;
  lastSynced?: Date;
};

export type CreateProjectParams = Pick<Project, "name" | "jql">;

export interface ProjectsRepository {
  getProjects(): Promise<Project[]>;
  createProject(project: CreateProjectParams): Promise<Project>;
  setSyncedDate(projectId: string, lastSynced: Date): Promise<Project>;
}
