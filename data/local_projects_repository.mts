import {
  Project,
  CreateProjectParams,
  ProjectsRepository,
} from "../domain/entities.js";
import { Low } from "lowdb";
import crypto from "crypto";
import { DBData } from "./db.mjs";

export class LocalProjectsRepository implements ProjectsRepository {
  constructor(private readonly db: Low<DBData>) {}

  async getProjects(): Promise<Project[]> {
    return this.db.data.projects;
  }

  async createProject(params: CreateProjectParams) {
    const project: Project = {
      id: crypto.randomUUID(),
      ...params,
    };
    this.db.data.projects.push(project);

    await this.db.write();

    return project;
  }

  async setSyncedDate(projectId: string, lastSynced: Date): Promise<Project> {
    const project = this.db.data.projects.find(
      (project) => project.id === projectId,
    );
    project.lastSynced = lastSynced;

    await this.db.write();

    return project;
  }
}
