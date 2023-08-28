import { Module } from "@nestjs/common";
import { DataModule } from "../data/data_module.mjs";
import { MainMenu } from "./main_menu.js";
import { ProjectsModule } from "./projects/projects_module.mjs";
import { MetricsModule } from "./metrics/metrics_module.mjs";

@Module({
  imports: [DataModule, ProjectsModule, MetricsModule],
  providers: [MainMenu],
})
export class AppModule {}
