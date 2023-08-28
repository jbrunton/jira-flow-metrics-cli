import { Module } from "@nestjs/common";
import { MetricsMenu } from "./metrics_menu.mjs";
import { CycleTimesAction } from "./actions/cycle_times.mjs";

@Module({
  providers: [MetricsMenu, CycleTimesAction],
  exports: [MetricsMenu],
})
export class MetricsModule {}
