import { Injectable } from "@nestjs/common";
import { CreateProjectParams } from "#entities/index.js";
import { createHash } from "crypto";
import { LocalProjectsRepository } from "#data/local/projects_repository.mjs";

export type CreateProjectActionArgs = Pick<CreateProjectParams, "name" | "jql">;

@Injectable()
export class CreateProjectAction {
  constructor(private readonly projectsRepository: LocalProjectsRepository) {}

  async run({ name, jql }: CreateProjectActionArgs): Promise<void> {
    const id = createHash("md5").update(`${name}:${jql}`).digest("base64url");
    await this.projectsRepository.createProject({ id, name, jql });
  }
}
