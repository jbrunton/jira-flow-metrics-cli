import { Injectable } from "@nestjs/common";
import { LocalProjectsRepository } from "#data/local/projects_repository.mjs";

export type RemoveProjectsActionArgs = {
  projectIds: string[];
};

@Injectable()
export class RemoveProjectsAction {
  constructor(private readonly projectsRepository: LocalProjectsRepository) {}

  async run({ projectIds }: RemoveProjectsActionArgs): Promise<void> {
    for (const projectId of projectIds) {
      await this.projectsRepository.removeProject(projectId);
    }
  }
}
