import { DashboardsRepository, Dashboard } from "../domain/entities.js";
import { LocalDatabase } from "./db.mjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalDashboardsRepository implements DashboardsRepository {
  constructor(private readonly db: LocalDatabase) {}

  async getDashboards(): Promise<Dashboard[]> {
    return this.db.data.dashboards;
  }

  async createDashboard(dashboard: Dashboard) {
    this.db.data.dashboards.push(dashboard);

    await this.db.write();

    return dashboard;
  }
}
