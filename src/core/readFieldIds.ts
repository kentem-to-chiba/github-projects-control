import axios from "axios";

const readFieldIds = async (
  personalAccessToken: string,
  projectId: string
): Promise<
  ({
    key: string;
    id: string;
  } & (
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
        type: "others";
      }
  ))[]
> => {
  const res = await axios.post<{
    data: {
      node: {
        fields: {
          nodes: ({
            id: string;
            name: string;
          } & (
            | {
                configuration: {
                  iterations: {
                    startDate: string;
                    id: string;
                  }[];
                  completedIterations: {
                    startDate: string;
                    id: string;
                  }[];
                };
              }
            | {
                options: {
                  id: string;
                  name: string;
                }[];
              }
            | { [key: string | number]: never }
          ))[];
        };
      };
    };
  }>(
    "https://api.github.com/graphql",
    {
      query: `
      query {
        node(id: "${projectId}") {
          ... on ProjectV2 {
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                }
                ... on ProjectV2IterationField {
                  id
                  name
                  configuration {
                    iterations {
                      startDate
                      id
                    }
                    completedIterations {
                      startDate
                      id
                    }
                  }
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
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

  return res.data.data.node.fields.nodes.map((node) => {
    if ("options" in node) {
      return {
        key: node.name,
        id: node.id,
        type: "singleSelect" as const,
        options: node.options.map((option) => ({
          id: option.id,
          value: option.name,
        })),
      };
    }
    if ("configuration" in node) {
      return {
        key: node.name,
        id: node.id,
        type: "iteration" as const,
        iterations: [
          ...node.configuration.iterations.map((iteration) => ({
            id: iteration.id,
            startDate: iteration.startDate,
          })),
          ...node.configuration.completedIterations.map((iteration) => ({
            id: iteration.id,
            startDate: iteration.startDate,
          })),
        ],
      };
    }
    return {
      key: node.name,
      id: node.id,
      type: "others" as const,
    };
  });
};
export default readFieldIds;
