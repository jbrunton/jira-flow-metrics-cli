import { Module } from "@nestjs/common";
import { DataModule } from "#data/data_module.mts";
import { MainMenu } from "./main_menu.ts";
import { ProjectsModule } from "./projects/projects_module.mts";
import { MetricsModule } from "./metrics/metrics_module.mts";
import { DashboardsModule } from "./dashboards/dashboards_module.mts";

@Module({
  imports: [DataModule, ProjectsModule, DashboardsModule, MetricsModule],
  providers: [MainMenu],
})
export class AppModule {}
