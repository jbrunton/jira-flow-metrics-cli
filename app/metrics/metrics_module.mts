import { Module } from "@nestjs/common";
import { MetricsMenu } from "./metrics_menu.mjs";
import { CycleTimesAction } from "./actions/cycle_times.mjs";
import { ThroughputAction } from "./actions/throughput.mjs";

@Module({
  providers: [MetricsMenu, CycleTimesAction, ThroughputAction],
  exports: [MetricsMenu],
})
export class MetricsModule {}
