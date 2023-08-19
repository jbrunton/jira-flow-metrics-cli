import { Version3Client } from "jira.js";
import { Issue, IssuesRepository, SearchParams } from "../domain/entities";
import { mapLimit } from "async";
import { range } from "lodash";

export class JiraIssuesRepository implements IssuesRepository {
  constructor(private readonly client: Version3Client) {}

  async search({ jql, onProgress, builder }: SearchParams): Promise<Issue[]> {
    const searchParams = {
      jql,
      expand: ["changelog"],
      fields: [
        "key",
        "summary",
        "issuetype",
        "status",
        "resolution",
        "created",
        // builder.epicLinkFieldId,
        // builder.parentFieldId,
      ],
    };

    onProgress(0, 1);

    const firstPage =
      await this.client.issueSearch.searchForIssuesUsingJqlPost(searchParams);

    const maxResults = firstPage.maxResults;
    const total = firstPage.total;

    if (total === undefined || maxResults === undefined) {
      throw new Error(
        `Response missing fields: total=${total}, maxResults: ${maxResults}`,
      );
    }

    const pageCount = Math.ceil(total / maxResults);

    let progress = 0;
    const incrementProgress = () => {
      progress += 1;
      onProgress(progress, pageCount);
    };
    incrementProgress();

    const remainingPages = await mapLimit(
      range(1, pageCount),
      5,
      async (pageIndex: number) => {
        const page = await this.client.issueSearch.searchForIssuesUsingJqlPost({
          ...searchParams,
          startAt: pageIndex * maxResults,
        });
        incrementProgress();
        return page;
      },
    );

    const pages = [firstPage, ...remainingPages];
    const issues = pages.reduce<Issue[]>((issues, page) => {
      if (!page.issues) {
        return issues;
      }

      const pageIssues = page.issues.map((issue) => builder.build(issue));

      return [...issues, ...pageIssues];
    }, []);

    return issues;
  }
}
