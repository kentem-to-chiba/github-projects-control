import axios from "axios";

const addAssignees = async (
  personalAccessToken: string,
  itemId: string,
  assigneeIds: string[],
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
          addAssigneesToAssignable(input: { assignableId: "${itemId}" assigneeIds: [${assigneeIds.map((x) => `"${x}"`)}] }) {
            clientMutationId
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
    await post();
    return;
  } catch (_) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await addAssignees(personalAccessToken, itemId, assigneeIds, retryCount + 1);
    return;
  }
};
export default addAssignees;
