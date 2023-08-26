import inquirer from "inquirer";
import AutocompletePrompt from "inquirer-autocomplete-prompt";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import DatePickerPrompt from "inquirer-date-prompt";

inquirer.registerPrompt("autocomplete", AutocompletePrompt);
inquirer.registerPrompt("date", DatePickerPrompt);
