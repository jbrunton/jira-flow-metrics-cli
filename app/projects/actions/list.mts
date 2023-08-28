import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "../../../data/local_projects_repository.mjs";

@Injectable()
export class ListProjectsAction {
  constructor(private readonly projectsRepository: LocalProjectsRepository) {}

  async run() {
    const projects = await this.projectsRepository.getProjects();
    console.table(projects);
  }
}
