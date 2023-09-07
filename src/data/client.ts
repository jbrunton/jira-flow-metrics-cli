import { Version3Client } from "jira.js";

const email: string = process.env.JIRA_USER ?? "";
const apiToken: string = process.env.JIRA_TOKEN ?? "";
const host: string | undefined = process.env.JIRA_HOST;

export const client = new Version3Client({
  host,
  authentication: {
    basic: {
      email,
      apiToken,
    },
  },
  newErrorHandling: true,
});
