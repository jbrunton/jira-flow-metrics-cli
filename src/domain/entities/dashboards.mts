import { Project } from "./projects.mts";

export type DashboardDefinition = {
  name: string;
  projects: Omit<Project, "lastSynced">[];
};

export type Dashboard = {
  id: string;
  definition: DashboardDefinition;
  url?: string;
};
