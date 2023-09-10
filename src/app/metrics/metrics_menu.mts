import { Injectable } from "@nestjs/common";
import { CycleTimesMenuItem } from "./cycle_times/menu.js";
import { ThroughputMenuItem } from "./throughput/menu.js";
import { MenuFactory } from "../lib/menus/factory.js";
import { cancelMenuItem } from "#app/lib/menus/cancel.ts";

@Injectable()
export class MetricsMenu extends MenuFactory {
  constructor(
    cycleTimesMenu: CycleTimesMenuItem,
    throughputMenu: ThroughputMenuItem,
  ) {
    super("Metrics", [cycleTimesMenu, throughputMenu, cancelMenuItem()]);
  }
}
