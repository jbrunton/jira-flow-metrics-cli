import { MenuItem } from "./types.js";

export const cancelMenuItem: MenuItem = {
  name: "Cancel",
  run() {
    return Promise.resolve();
  },
};
