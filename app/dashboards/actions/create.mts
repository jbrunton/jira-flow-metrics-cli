import { Injectable } from "@nestjs/common";
import { downloadFile } from "../../lib/http/download_file.mjs";
import { LocalDashboardsRepository } from "../../../data/local_dashboards_repository.mjs";
import { createHash } from "crypto";

export type CreateDashboardActionArgs = {
  remoteUrl: string;
};
// https://raw.githubusercontent.com/jbrunton/jira-flow-metrics/b45512f12abb22fee3527cdedf24e8e9033716e7/example-dashboard.json
// https://raw.githubusercontent.com/jbrunton/jira-flow-metrics-dashboard/main/example.json
@Injectable()
export class CreateDashboardAction {
  constructor(
    private readonly dashboardsRepository: LocalDashboardsRepository,
  ) {}

  async run({ remoteUrl }: CreateDashboardActionArgs) {
    const definition = await downloadFile(remoteUrl);

    const dashboard = {
      url: remoteUrl,
      definition: JSON.parse(definition),
    };

    const id = createHash("md5")
      .update(JSON.stringify(dashboard))
      .digest("base64url");

    await this.dashboardsRepository.createDashboard({
      id,
      ...dashboard,
    });
    //logger.info(dashboard);
  }
}
