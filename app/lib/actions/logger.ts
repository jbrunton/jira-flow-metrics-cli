import ora, { Ora } from "ora";
import chalk from "chalk";

export enum IndentationLevel {
  Action,
  Global,
}

export const logger = {
  info(
    message: string,
    indentationLevel: IndentationLevel = IndentationLevel.Action,
  ) {
    console.info(
      indentationLevel === IndentationLevel.Global
        ? message
        : `\t` + message.replace(/\n/g, "\t\n"),
    );
  },

  appendStatus(status: string) {
    console.info(` ${status}`);
  },

  startLoading(message: string): Ora {
    return ora(chalk.white(message)).start();
  },

  stopLoading(spinner: Ora, { success }: { success: boolean }) {
    spinner.stopAndPersist({
      symbol: success ? chalk.green("✓") : chalk.red("✘"),
    });
  },
};
