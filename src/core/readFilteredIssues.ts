import axios from "axios";
import { Filter } from "../App";

type ProjectItems =
  | {
      nodes: {
        fieldValues: {
          nodes: (
            | ({
                id: string;
                field: {
                  id: string;
                  name: string;
                };
              } & ({ text: string } | { date: string } | { number: number } | { name: string } | { startDate: string }))
            | { [key: string | number]: never }
          )[];
        };
      }[];
    }
  | undefined;

export type Nodes = {
  content: {
    id: string;
    title: string;
    assignees: {
      nodes: {
        id: string;
        name: string;
      }[];
    };
  } & (
    | {
        projectV2Items: ProjectItems;
      }
    | {
        projectItems: ProjectItems;
      }
  );
}[];

const readFilteredItems = async (
  personalAccessToken: string,
  cursor: string,
  filters: Filter[]
): Promise<{
  filteredNodes: Nodes;
  endCursor: string | undefined;
}> => {
  const res = await axios.post<{
    data: {
      organization: {
        projectV2: {
          title: string;
          items: {
            pageInfo: {
              hasNextPage: boolean;
              endCursor: string;
            };
            nodes: Nodes;
          };
        };
      };
    };
  }>(
    "https://api.github.com/graphql",
    {
      query: `
      query {
        organization(login: "ks-kentem") {
          projectV2(number: 16) {
            title
            items(first: 100 after: "${cursor}") {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                content {
                  ... on DraftIssue {
                    id
                    title
                    assignees(first: 10) {
                      nodes {
                        id
                        name
                      }
                    }
                    projectV2Items(first: 1) {
                      nodes {
                        fieldValues(first: 12) {
                          nodes {
                            ... on ProjectV2ItemFieldTextValue {
                              id
                              text
                              field {
                                ... on ProjectV2Field {
                                  id
                                  name
                                }
                              }
                            }
                            ... on ProjectV2ItemFieldDateValue {
                              id
                              date
                              field {
                                ... on ProjectV2Field {
                                  id
                                  name
                                }
                              }
                            }
                            ... on ProjectV2ItemFieldNumberValue {
                              id
                              number
                              field {
                                ... on ProjectV2Field {
                                  id
                                  name
                                }
                              }
                            }
                            ... on ProjectV2ItemFieldSingleSelectValue {
                              id
                              name
                              field {
                                ... on ProjectV2SingleSelectField {
                                  id
                                  name
                                }
                              }
                            }
                            ... on ProjectV2ItemFieldIterationValue {
                              id
                              startDate
                              field {
                                ... on ProjectV2IterationField {
                                  id
                                  name
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  ... on Issue {
                    id
                    title
                    assignees(first: 10) {
                      nodes {
                        id
                        name
                      }
                    }
                    projectItems(first: 1) {
                      nodes {
                        fieldValues(first: 12) {
                          nodes {
                            ... on ProjectV2ItemFieldTextValue {
                              id
                              text
                              field {
                                ... on ProjectV2Field {
                                  id
                                  name
                                }
                              }
                            }
                            ... on ProjectV2ItemFieldDateValue {
                              id
                              date
                              field {
                                ... on ProjectV2Field {
                                  id
                                  name
                                }
                              }
                            }
                            ... on ProjectV2ItemFieldNumberValue {
                              id
                              number
                              field {
                                ... on ProjectV2Field {
                                  id
                                  name
                                }
                              }
                            }
                            ... on ProjectV2ItemFieldSingleSelectValue {
                              id
                              name
                              field {
                                ... on ProjectV2SingleSelectField {
                                  id
                                  name
                                }
                              }
                            }
                            ... on ProjectV2ItemFieldIterationValue {
                              id
                              startDate
                              field {
                                ... on ProjectV2IterationField {
                                  id
                                  name
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${personalAccessToken}`,
      },
    }
  );

  const items = res.data.data.organization.projectV2.items;
  const filteredNodes = items.nodes.filter((node1) => {
    if (!node1.content) return false;

    if ("projectItems" in node1.content) {
      if (!node1.content.projectItems) return false;

      return (
        node1.content.projectItems.nodes[0].fieldValues.nodes.every((node2) => {
          // NOTE: filterに含まれないもの(空オブジェクト)はパス
          if (!("field" in node2)) return true;

          for (const filter of filters) {
            if (
              filter.key === node2.field.name &&
              filter.type === "text" &&
              "text" in node2 &&
              filter.value !== node2.text
            )
              return false;
            if (
              filter.key === node2.field.name &&
              filter.type === "date" &&
              "date" in node2 &&
              filter.value !== node2.date
            )
              return false;
            if (
              filter.key === node2.field.name &&
              filter.type === "number" &&
              "number" in node2 &&
              filter.value !== node2.number
            )
              return false;
            if (
              filter.key === node2.field.name &&
              filter.type === "singleSelect" &&
              "name" in node2 &&
              filter.value !== node2.name
            )
              return false;
            if (
              filter.key === node2.field.name &&
              filter.type === "iteration" &&
              "iteration" in node2 &&
              filter.value !== node2.startDate
            )
              return false;
          }

          return true;
        }) &&
        filters.every((filter) => {
          if (!("projectItems" in node1.content)) throw new Error();
          if (!node1.content.projectItems) throw new Error();
          return node1.content.projectItems.nodes[0].fieldValues.nodes.some((node2) => {
            if (!("id" in node2)) return false;
            return node2.field.name === filter.key;
          });
        })
      );
    } else {
      if (!node1.content.projectV2Items) return false;

      return (
        node1.content.projectV2Items.nodes[0].fieldValues.nodes.every((node2) => {
          // NOTE: filterに含まれないもの(空オブジェクト)はパス
          if (!("field" in node2)) return true;

          for (const filter of filters) {
            if (
              filter.key === node2.field.name &&
              filter.type === "text" &&
              "text" in node2 &&
              filter.value !== node2.text
            )
              return false;
            if (
              filter.key === node2.field.name &&
              filter.type === "date" &&
              "date" in node2 &&
              filter.value !== node2.date
            )
              return false;
            if (
              filter.key === node2.field.name &&
              filter.type === "number" &&
              "number" in node2 &&
              filter.value !== node2.number
            )
              return false;
            if (
              filter.key === node2.field.name &&
              filter.type === "singleSelect" &&
              "name" in node2 &&
              filter.value !== node2.name
            )
              return false;
            if (
              filter.key === node2.field.name &&
              filter.type === "iteration" &&
              "startDate" in node2 &&
              filter.value !== node2.startDate
            )
              return false;
          }

          return true;
        }) &&
        filters.every((filter) => {
          if (!("projectV2Items" in node1.content)) throw new Error();
          if (!node1.content.projectV2Items) throw new Error();
          return node1.content.projectV2Items.nodes[0].fieldValues.nodes.some((node2) => {
            if (!("id" in node2)) return false;
            return node2.field.name === filter.key;
          });
        })
      );
    }
  });
  return { filteredNodes, endCursor: items.pageInfo.hasNextPage ? items.pageInfo.endCursor : undefined };
};
export default readFilteredItems;
