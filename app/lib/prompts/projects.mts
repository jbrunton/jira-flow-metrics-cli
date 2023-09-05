import { checkbox } from "@inquirer/prompts";
import { Project } from "../../../domain/entities.js";

export const selectProjects = async (
  projects: Project[],
): Promise<string[]> => {
  const projectIds = await checkbox({
    message: "Choose projects",
    choices: projects.map((project) => ({
      name: project.name,
      value: project.id,
      checked: false,
    })),
  });

  return projectIds;
};
