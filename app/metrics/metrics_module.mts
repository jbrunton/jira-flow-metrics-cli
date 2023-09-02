import { Module } from "@nestjs/common";
import { MetricsMenu } from "./metrics_menu.mjs";
import { CycleTimesReportAction } from "./cycle_times/action.js";
import { CycleTimesMenuItem } from "./cycle_times/menu.js";
import { ThroughputMenuItem } from "./throughput/menu.js";
import { ThroughputReportAction } from "./throughput/action.js";

@Module({
  providers: [
    MetricsMenu,
    CycleTimesReportAction,
    CycleTimesMenuItem,
    ThroughputReportAction,
    ThroughputMenuItem,
  ],
  exports: [MetricsMenu],
})
export class MetricsModule {}
