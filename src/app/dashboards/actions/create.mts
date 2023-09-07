import { Injectable } from "@nestjs/common";
import { downloadFile } from "../../lib/http/download_file.mjs";
import { LocalDashboardsRepository } from "../../../data/local/dashboards_repository.mjs";
import { createHash } from "crypto";
import { DashboardDefinition } from "../../../domain/entities.js";

export type CreateDashboardActionArgs =
  | {
      remoteUrl: string;
    }
  | {
      definition: DashboardDefinition;
    };

@Injectable()
export class CreateDashboardAction {
  constructor(
    private readonly dashboardsRepository: LocalDashboardsRepository,
  ) {}

  async run(args: CreateDashboardActionArgs) {
    const dashboard =
      "definition" in args
        ? { definition: args.definition }
        : {
            url: args.remoteUrl,
            definition: JSON.parse(await downloadFile(args.remoteUrl)),
          };

    const id = createHash("md5")
      .update(JSON.stringify(dashboard))
      .digest("base64url");

    await this.dashboardsRepository.createDashboard({
      id,
      ...dashboard,
    });
  }
}
