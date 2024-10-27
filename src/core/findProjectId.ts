import axios from "axios";

const findProjectId = async (
  personalAccessToken: string,
  projectNumber: number
): Promise<{ id: string; title: string }> => {
  const res = await axios.post<{
    data: {
      organization: {
        projectV2: {
          id: string;
          title: string;
        };
      };
    };
  }>(
    "https://api.github.com/graphql",
    {
      query: `
      query {
        organization(login: "ks-kentem"){
          projectV2(number: ${projectNumber}) {
            id
            title
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

  return { ...res.data.data.organization.projectV2 };
};
export default findProjectId;
