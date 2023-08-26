import { select } from "@inquirer/prompts";
import { projectsMenuAction } from "./app/projects.mjs";

import inquirer from "inquirer";
import AutocompletePrompt from "inquirer-autocomplete-prompt";
import DatePickerPrompt from "inquirer-date-prompt";
import { db } from "./data/db.mjs";
import { metricsMenuAction } from "./app/metrics.mjs";

inquirer.registerPrompt("autocomplete", AutocompletePrompt);
inquirer.registerPrompt("date", DatePickerPrompt);

const main = async () => {
  await db.read();
  const answer = await select({
    message: "Select an option",
    choices: [
      {
        name: "Metrics",
        value: "metrics",
        description: "Cycle time metrics for longest stories",
      },
      {
        name: "Projects",
        value: "projects",
      },
      {
        name: "Quit",
        value: "quit",
        description: "Exit the program",
      },
    ],
  });

  console.group();

  if (answer === "metrics") {
    await metricsMenuAction();
  }

  if (answer === "projects") {
    await projectsMenuAction();
  }

  console.groupEnd();

  if (answer !== "quit") {
    await main();
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
