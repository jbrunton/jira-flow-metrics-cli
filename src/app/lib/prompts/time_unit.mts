import { select } from "@inquirer/prompts";
import { TimeUnit } from "../../../domain/intervals.mjs";

export const promptTimeUnit = async (): Promise<TimeUnit> => {
  const timeUnit = await select({
    message: "Time unit",
    choices: [
      { name: "Day", value: "day" },
      { name: "Week", value: "week" },
      { name: "Month", value: "month" },
    ],
  });

  return timeUnit as TimeUnit;
};
