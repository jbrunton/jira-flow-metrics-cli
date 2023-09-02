import { Version3Client } from "jira.js";
import { Filter, FiltersRepository } from "../domain/entities.js";
import { reject, isNil } from "rambda";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JiraFiltersRepository implements FiltersRepository {
  constructor(private readonly client: Version3Client) {}

  async getFilters(filterName?: string): Promise<Filter[]> {
    const firstPage = await this.client.filters.getFiltersPaginated({
      filterName,
      expand: "jql",
    });
    return reject(isNil)(
      firstPage.values.map((filter) => {
        return {
          name: filter.name,
          jql: filter.jql,
        };
      }),
    );
  }
}
