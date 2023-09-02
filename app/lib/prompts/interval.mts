import inquirer from "inquirer";
import { Interval } from "../../../domain/entities.js";

export const promptInterval = async (
  defaultStart: Date,
  defaultEnd: Date,
): Promise<Interval> => {
  const { start } = await inquirer.prompt({
    type: "date",
    name: "start",
    message: "interval start",
    default: defaultStart,
    format: { month: "short", hour: undefined, minute: undefined },
  });

  const { end } = await inquirer.prompt({
    type: "date",
    name: "end",
    message: "interval end",
    default: defaultEnd,
    format: { month: "short", hour: undefined, minute: undefined },
  });

  return { start, end };
};
