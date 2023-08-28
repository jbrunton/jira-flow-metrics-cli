import { Version3Client } from "jira.js";
import { Field, FieldsRepository } from "../domain/entities.js";
import { reject, isNil } from "rambda";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JiraFieldsRepository implements FieldsRepository {
  constructor(private readonly client: Version3Client) {}

  async getFields(): Promise<Field[]> {
    const jiraFields = await this.client.issueFields.getFields();
    return reject(isNil)(
      jiraFields.map((field) => {
        if (field.id === undefined) {
          console.warn(`Missing id for field ${field}`);
          return null;
        }

        return {
          jiraId: field.id,
          name: field.name,
        };
      }),
    );
  }
}
