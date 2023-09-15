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

export type JiraProject = {
  name: string;
  key: string;
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
