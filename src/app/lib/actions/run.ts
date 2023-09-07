import { logger } from "./logger.js";
import { Action } from "./types.js";

export const run = async <T>(name: string, action: Action<T>): Promise<T> => {
  const spinner = logger.startLoading(name);

  const onUpdate = (text) => (spinner.suffixText = text);

  try {
    const result = await action(onUpdate);
    logger.stopLoading(spinner, { success: true });
    return result;
  } catch (e) {
    logger.stopLoading(spinner, { success: false });
    throw e;
  }
};
