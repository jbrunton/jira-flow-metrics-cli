import remove from "lodash/remove.js";
import {
  Project,
  CreateProjectParams,
  ProjectsRepository,
} from "#entities/index.js";
import { LocalDatabase } from "./db.mjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalProjectsRepository implements ProjectsRepository {
  constructor(private readonly db: LocalDatabase) {}

  async getProjects(): Promise<Project[]> {
    return this.db.data.projects;
  }

  async createProject(params: CreateProjectParams) {
    this.db.data.projects.push(params);

    await this.db.write();

    return params;
  }

  async removeProject(projectId: string) {
    remove(this.db.data.projects, (project) => project.id === projectId);
    await this.db.write();
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
