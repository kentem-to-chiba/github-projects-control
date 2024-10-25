import createDraftIssue from "./createDraftIssue";
import readFieldIds from "./readFieldIds";
import updateIssueField from "./updateIssueField";
import readFilteredIssues, { Nodes } from "./readFilteredIssues";
import { Filter } from "../App";
import { DistributiveOmit } from "@emotion/react";

const copyFilteredRows = async (
  personalAccessToken: string,
  projectId: string,
  filters: Filter[],
  copyTargets: DistributiveOmit<Filter, "value">[]
) => {
  let cursor: string | undefined = "";
  const returnValue: Nodes = [];
  while (cursor !== undefined) {
    const { filteredNodes, endCursor } = await readFilteredIssues(personalAccessToken, cursor, filters);
    cursor = endCursor;
    returnValue.push(...filteredNodes);
  }

  const shapedReturnValue: {
    id: string;
    title: string;
    assigneeIds: string[];
    field: {
      [key: string]: string | number | undefined;
    };
  }[] = returnValue.map((node) => {
    if ("projectItems" in node.content) {
      if (!node.content.projectItems) throw new Error();
      return {
        id: node.content.id,
        title: node.content.title,
        assigneeIds: node.content.assignees.nodes.map((assignee) => assignee.id),
        field: node.content.projectItems.nodes[0].fieldValues.nodes.reduce(
          (
            accumulator: {
              [key: string]: string | number;
            },
            currentValue
          ) => {
            if ("text" in currentValue) return { ...accumulator, [currentValue.field.name]: currentValue.text };
            if ("name" in currentValue) return { ...accumulator, [currentValue.field.name]: currentValue.name };
            if ("number" in currentValue) return { ...accumulator, [currentValue.field.name]: currentValue.number };
            if ("date" in currentValue) return { ...accumulator, [currentValue.field.name]: currentValue.date };
            if ("startDate" in currentValue)
              return { ...accumulator, [currentValue.field.name]: currentValue.startDate };
            return accumulator;
          },
          {}
        ),
      };
    } else {
      if (!node.content.projectV2Items) throw new Error();
      return {
        id: node.content.id,
        title: node.content.title,
        assigneeIds: node.content.assignees.nodes.map((assignee) => assignee.id),
        field: node.content.projectV2Items.nodes[0].fieldValues.nodes.reduce(
          (
            accumulator: {
              [key: string]: string | number;
            },
            currentValue
          ) => {
            if ("text" in currentValue) return { ...accumulator, [currentValue.field.name]: currentValue.text };
            if ("name" in currentValue) return { ...accumulator, [currentValue.field.name]: currentValue.name };
            if ("number" in currentValue) return { ...accumulator, [currentValue.field.name]: currentValue.number };
            if ("date" in currentValue) return { ...accumulator, [currentValue.field.name]: currentValue.date };
            if ("startDate" in currentValue)
              return { ...accumulator, [currentValue.field.name]: currentValue.startDate };
            return accumulator;
          },
          {}
        ),
      };
    }
  });

  const fieldIds = await readFieldIds(personalAccessToken, projectId);
  const filtersWithFieldId: ({
    id: string;
    key: string;
  } & (
    | {
        value: string;
        type: "text" | "date";
      }
    | {
        value: string;
        type: "singleSelect";
        options: {
          id: string;
          value: string;
        }[];
      }
    | {
        value: string;
        type: "iteration";
        iterations: {
          id: string;
          startDate: string;
        }[];
      }
    | {
        value: number;
        type: "number";
      }
  ))[] = filters.map((filter) => {
    const field = fieldIds.find((field) => field.key === filter.key);
    if (!field) throw new Error();
    if (field.type === "singleSelect") {
      if (filter.type !== "singleSelect") throw new Error();
      return { ...filter, id: field.id, options: field.options };
    }
    if (field.type === "iteration") {
      if (filter.type !== "iteration") throw new Error();
      return { ...filter, id: field.id, iterations: field.iterations };
    }
    if (filter.type === "singleSelect" || filter.type === "iteration") throw new Error();
    return { ...filter, id: field.id };
  });

  const copyTargetsWithFieldId: ({
    id: string;
    key: string;
  } & (
    | {
        type: "text" | "date";
      }
    | {
        type: "singleSelect";
        options: {
          id: string;
          value: string;
        }[];
      }
    | {
        type: "iteration";
        iterations: {
          id: string;
          startDate: string;
        }[];
      }
    | {
        type: "number";
      }
  ))[] = copyTargets.map((copyTarget) => {
    const field = fieldIds.find((field) => field.key === copyTarget.key);
    if (!field) throw new Error();
    if (field.type === "singleSelect") {
      if (copyTarget.type !== "singleSelect") throw new Error();
      return { ...copyTarget, id: field.id, options: field.options };
    }
    if (field.type === "iteration") {
      if (copyTarget.type !== "iteration") throw new Error();
      return { ...copyTarget, id: field.id, iterations: field.iterations };
    }
    if (copyTarget.type === "singleSelect" || copyTarget.type === "iteration") throw new Error();
    return { ...copyTarget, id: field.id };
  });

  await Promise.all(
    shapedReturnValue.map((node) =>
      (async () => {
        const createdDraftIssue = await createDraftIssue(personalAccessToken, projectId, node.title);
        if (!createdDraftIssue) throw new Error();
        await Promise.all([
          ...filtersWithFieldId.map((filter) => {
            switch (filter.type) {
              case "singleSelect": {
                const option = filter.options.find((option) => option.value === node.field[filter.key]);
                if (!option) throw new Error();
                return updateIssueField(personalAccessToken, projectId, filter.id, createdDraftIssue.id, {
                  singleSelectOptionId: option.id,
                });
              }
              case "iteration": {
                const iteration = filter.iterations.find((iteration) => iteration.startDate === node.field[filter.key]);
                if (!iteration) throw new Error();
                return updateIssueField(personalAccessToken, projectId, filter.id, createdDraftIssue.id, {
                  iterationId: iteration.id,
                });
              }
              case "text": {
                const text = node.field[filter.key];
                if (typeof text !== "string") throw new Error();
                return updateIssueField(personalAccessToken, projectId, filter.id, createdDraftIssue.id, { text });
              }
              case "number": {
                const number = node.field[filter.key];
                if (typeof number !== "number") throw new Error();
                return updateIssueField(personalAccessToken, projectId, filter.id, createdDraftIssue.id, { number });
              }
              case "date": {
                const date = node.field[filter.key];
                if (typeof date !== "string") throw new Error();
                return updateIssueField(personalAccessToken, projectId, filter.id, createdDraftIssue.id, { date });
              }
            }
          }),
          ...copyTargetsWithFieldId.map((copyTarget) => {
            switch (copyTarget.type) {
              case "singleSelect": {
                const option = copyTarget.options.find((option) => option.value === node.field[copyTarget.key]);
                if (!option) throw new Error();
                return updateIssueField(personalAccessToken, projectId, copyTarget.id, createdDraftIssue.id, {
                  singleSelectOptionId: option.id,
                });
              }
              case "iteration": {
                const iteration = copyTarget.iterations.find(
                  (iteration) => iteration.startDate === node.field[copyTarget.key]
                );
                if (!iteration) throw new Error();
                return updateIssueField(personalAccessToken, projectId, copyTarget.id, createdDraftIssue.id, {
                  iterationId: iteration.id,
                });
              }
              case "text": {
                const text = node.field[copyTarget.key];
                if (typeof text !== "string") throw new Error();
                return updateIssueField(personalAccessToken, projectId, copyTarget.id, createdDraftIssue.id, { text });
              }
              case "number": {
                const number = node.field[copyTarget.key];
                if (number === undefined) return;
                if (typeof number !== "number") throw new Error();
                return updateIssueField(personalAccessToken, projectId, copyTarget.id, createdDraftIssue.id, {
                  number,
                });
              }
              case "date": {
                const date = node.field[copyTarget.key];
                if (typeof date !== "string") throw new Error();
                return updateIssueField(personalAccessToken, projectId, copyTarget.id, createdDraftIssue.id, { date });
              }
            }
          }),
        ]);
      })()
    )
  );
};
export default copyFilteredRows;
