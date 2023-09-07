import { MenuItem } from "./types.js";

export const cancelMenuItem = (name?: string): MenuItem => ({
  name: name ?? "Cancel",
  run() {
    return Promise.resolve();
  },
});
