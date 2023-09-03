import { Injectable } from "@nestjs/common";
import { MenuItem } from "../../lib/menus/types.js";
import { input } from "@inquirer/prompts";
import { CreateDashboardAction } from "../actions/create.mjs";

@Injectable()
export class CreateDashboardMenuItem implements MenuItem {
  readonly name = "Create dashboard";

  constructor(private readonly createDashboardAction: CreateDashboardAction) {}

  async run(): Promise<void> {
    const remoteUrl = await input({
      message: "remote url",
    });
    await this.createDashboardAction.run({ remoteUrl });
  }
}
