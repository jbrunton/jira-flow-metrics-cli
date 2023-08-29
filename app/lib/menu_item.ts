import { Action } from "./action.js";
import { logger } from "./action_logger.js";

export abstract class MenuItem<T, R> {
  constructor(private readonly action: Action<T, R>) {}

  protected abstract readArgs(): Promise<T>;

  async run(): Promise<R> {
    const args = await this.readArgs();
    const spinner = logger.startLoading(this.action.name);

    try {
      const result = await this.action.run(args);
      logger.stopLoading(spinner, { success: true });
      this.onSuccess(result);
      return result;
    } catch {
      logger.stopLoading(spinner, { success: false });
    }
  }

  onSuccess(_result: R) {
    console.info(`Action ${this.action.name} completed`);
  }
}
