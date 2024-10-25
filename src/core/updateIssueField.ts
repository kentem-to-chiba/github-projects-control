import axios from "axios";

const updateIssueField = async (
  personalAccessToken: string,
  projectId: string,
  fieldId: string,
  itemId: string,
  param:
    | {
        date: string;
      }
    | {
        iterationId: string;
      }
    | {
        number: number;
      }
    | {
        singleSelectOptionId: string;
      }
    | {
        text: string;
      },
  retryCount = 0
): Promise<
  | {
      id: string;
    }
  | undefined
> => {
  if (retryCount > 3) return undefined;

  const post = async () =>
    await axios.post<{
      data: {
        addProjectV2DraftIssue: {
          projectV2Item: {
            id: string;
          };
        };
      };
    }>(
      "https://api.github.com/graphql",
      {
        query: `
        mutation {
          updateProjectV2ItemFieldValue(input: { projectId: "${projectId}", fieldId: "${fieldId}", itemId: "${itemId}", value: { ${"date" in param ? `date: "${param.date}"` : "iterationId" in param ? `iterationId: "${param.iterationId}"` : "number" in param ? `number: ${param.number}` : "singleSelectOptionId" in param ? `singleSelectOptionId: "${param.singleSelectOptionId}"` : "text" in param ? `text: "${param.text}"` : ""}}}) {
            projectV2Item {
              id
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
  try {
    const res = await post();
    return {
      id: res.data.data.addProjectV2DraftIssue?.projectV2Item.id ?? "",
    };
  } catch (_) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = await updateIssueField(personalAccessToken, projectId, fieldId, itemId, param, retryCount + 1);
    if (res === undefined) return undefined;
    return { id: res.id };
  }
};
export default updateIssueField;
