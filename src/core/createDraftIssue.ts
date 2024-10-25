import axios from "axios";

const createDraftIssue = async (
  personalAccessToken: string,
  projectId: string,
  title: string,
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
          projectItem: {
            id: string;
          };
        };
      };
    }>(
      "https://api.github.com/graphql",
      {
        query: `
      mutation {
        addProjectV2DraftIssue(input: {projectId: "${projectId}", title: "${title}" }) {
          projectItem {
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
      id: res.data.data.addProjectV2DraftIssue.projectItem.id,
    };
  } catch (_) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = await createDraftIssue(personalAccessToken, projectId, title, retryCount + 1);
    if (res === undefined) return undefined;
    return { id: res.id };
  }
};
export default createDraftIssue;
