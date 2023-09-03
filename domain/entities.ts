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
  parentKey?: string;
  started?: Date;
  completed?: Date;
  cycleTime?: number;
  transitions: Transition[];
};

export type StartedIssue = Issue & {
  started: Date;
};

export type CompletedIssue = Issue & {
  completed: Date;
};

export const isStarted = (issue: Issue): issue is StartedIssue =>
  issue.started !== undefined;
export const isCompleted = (issue: Issue): issue is CompletedIssue =>
  issue.completed !== undefined;

export interface IssueBuilder {
  getRequiredFields(): string[];
  build(json: Version3Models.Issue): Issue;
}

export type SearchParams = {
  jql: string;
  onProgress: (pageIndex: number, total: number) => void;
  builder: IssueBuilder;
};

export abstract class IssuesRepository {
  abstract search({ jql, onProgress }: SearchParams): Promise<Issue[]>;
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

export type CreateProjectParams = Pick<Project, "id" | "name" | "jql">;

export interface ProjectsRepository {
  getProjects(): Promise<Project[]>;
  createProject(project: CreateProjectParams): Promise<Project>;
  setSyncedDate(projectId: string, lastSynced: Date): Promise<Project>;
}

export type Interval = {
  start: Date;
  end: Date;
};

export type TimeUnit = "day" | "week" | "month";

export type DashboardReport = {
  projectId: string;
  type: string;
};

export type DashboardDefinition = {
  name: string;
  projects: Omit<Project, "lastSynced">[];
  reports: DashboardReport[];
};

export type Dashboard = {
  id: string;
  definition: DashboardDefinition;
  url?: string;
};

export interface DashboardsRepository {
  getDashboards(): Promise<Dashboard[]>;
  createDashboard(dashboard: Dashboard): Promise<Dashboard>;
}
