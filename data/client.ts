import { Version3Client } from "jira.js";

const email: string = process.env.JIRA_USER ?? "";
const apiToken: string = process.env.JIRA_TOKEN ?? "";

export const client = new Version3Client({
  //host: 'https://converge-io.atlassian.net',
  host: "https://jbrunton.atlassian.net",
  authentication: {
    basic: {
      email,
      apiToken,
    },
  },
  newErrorHandling: true, // This flag enable new error handling.
});
