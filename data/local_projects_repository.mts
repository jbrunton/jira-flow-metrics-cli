import {
  Project,
  CreateProjectParams,
  ProjectsRepository,
} from "../domain/entities.js";
import crypto from "crypto";
import { LocalDatabase } from "./db.mjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalProjectsRepository implements ProjectsRepository {
  constructor(private readonly db: LocalDatabase) {}

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
