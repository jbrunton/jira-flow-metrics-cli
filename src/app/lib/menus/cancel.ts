import { MenuItem } from "./types.js";

export const cancelMenuItem = (name?: string): MenuItem => ({
  name: name ?? "Back",
  value: "cancel",
  run() {
    return Promise.resolve();
  },
});
