import { select } from "@inquirer/prompts";
import { cancelMenuItem } from "./cancel.js";
import { MenuItem } from "./types.js";

export class MenuFactory implements MenuItem {
  private readonly choices: MenuItem[];

  constructor(
    readonly name: string,
    choices: MenuItem[],
  ) {
    this.choices = [...choices, cancelMenuItem()];
  }

  async run(): Promise<void> {
    const selectedItem = await select({
      message: `${this.name} >`,
      choices: this.choices.map(({ name }) => ({
        name,
        value: name,
      })),
    });

    const menuItem = this.choices.find(({ name }) => name === selectedItem);

    await menuItem.run();
  }
}
