import { Version3Models } from "jira.js";
import {
  Field,
  HierarchyLevel,
  Issue,
  Status,
  StatusCategory,
  Transition,
} from "../domain/entities.js";
import { reject, isNil } from "rambda";

export class IssueBuilder {
  private readonly statusCategories: { [externalId: string]: string } = {};

  constructor(
    private readonly fields: Field[],
    statuses: Status[],
  ) {
    for (const status of statuses) {
      this.statusCategories[status.jiraId] = status.category;
    }
  }

  build(json: Version3Models.Issue) {
    const status = json.fields.status.name;
    const statusCategory = json.fields.status.statusCategory
      ?.name as StatusCategory;
    const issueType = json.fields.issuetype?.name;
    const hierarchyLevel =
      issueType === "Epic" ? HierarchyLevel.Epic : HierarchyLevel.Story;

    if (!statusCategory) {
      throw new Error(`Status category for issue ${json.key} is undefined`);
    }

    const transitions = this.buildTransitions(json);
    const startedDate = getStartedDate(transitions);
    const completedDate = getCompletedDate(transitions);
    const cycleTime = getCycleTime(startedDate, completedDate);

    const issue: Issue = {
      key: json.key,
      summary: json.fields.summary,
      issueType,
      hierarchyLevel,
      status,
      statusCategory,
      transitions,
      started: startedDate,
      completed: completedDate,
      cycleTime,
    };
    return issue;
  }

  buildTransitions(json: Version3Models.Issue): Transition[] {
    //console.log("buildTransitions", json);
    const transitions: Transition[] = reject(isNil)(
      json.changelog?.histories?.map((event) => {
        const statusChange = event.items?.find(
          (item) => item.field == "status",
        );
        if (!statusChange) {
          return null;
        }

        const fromStatus = {
          name: statusChange.fromString,
          category: this.statusCategories[
            statusChange.from ?? ""
          ] as StatusCategory,
        };

        const toStatus = {
          name: statusChange.toString,
          category: this.statusCategories[
            statusChange.to ?? ""
          ] as StatusCategory,
        };
        if (!fromStatus.category) {
          // console.warn(
          //   `Could not find status with id ${statusChange.from} (${statusChange.fromString})`
          // );
        }
        if (!toStatus.category) {
          // console.warn(
          //   `Could not find status with id ${statusChange.to} (${statusChange.toString})`
          // );
        }
        //console.log(event.created);
        return {
          date: new Date(Date.parse(event.created ?? "")),
          fromStatus,
          toStatus,
        };
      }),
    );

    return transitions.sort((t1, t2) => t1.date.getTime() - t2.date.getTime());
  }
}

const getStartedDate = (transitions: Array<Transition>): Date | undefined => {
  const startedTransition = transitions.find(
    (transition) => transition.toStatus.category === StatusCategory.InProgress,
  );

  return startedTransition?.date;
};

const getCompletedDate = (transitions: Array<Transition>): Date | undefined => {
  const lastTransition = transitions
    .reverse()
    .find(
      (transition) =>
        transition.toStatus.category === StatusCategory.Done &&
        transition.fromStatus.category !== StatusCategory.Done,
    );

  return lastTransition?.date;
};

const getCycleTime = (started?: Date, completed?: Date): number | undefined => {
  if (!started || !completed) {
    return undefined;
  }

  return (completed.getTime() - started.getTime()) / (1_000 * 60 * 60 * 24);
};
