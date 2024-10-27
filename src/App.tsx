import { FormEventHandler, useState } from "react";
import "./App.css";
import { Box, Button, Container, InputLabel, Link, MenuItem, Select, TextField } from "@mui/material";
import copyFilteredRows from "./core/copyFilteredRows";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type KeyOfUnion<T> = T extends T ? keyof T : never;
export type DistributiveOmit<T, K extends KeyOfUnion<T>> = T extends T ? Omit<T, K> : never;

export type Filter =
  | {
      key: string;
      value: string;
      type: "text" | "date";
    }
  | {
      key: string;
      value: number;
      type: "number";
    }
  | {
      key: string;
      value: string;
      type: "singleSelect";
    }
  | {
      key: string;
      value: string;
      type: "iteration";
    };

type Env = {
  personalAccessToken: string;
  projectId: string;
  setPersonalAccessToken: (personalAccessToken: string) => void;
  setProjectId: (projectId: string) => void;
};

const useEnvStore = create<Env, [["zustand/persist", Env]]>(
  persist(
    (set): Env => ({
      personalAccessToken: "",
      projectId: "",
      setPersonalAccessToken: (personalAccessToken) => set({ personalAccessToken }),
      setProjectId: (projectId) => set({ projectId }),
    }),
    {
      name: "envStore",
    }
  )
);

function App() {
  const personalAccessToken = useEnvStore((env) => env.personalAccessToken);
  const projectId = useEnvStore((env) => env.projectId);
  const setPersonalAccessToken = useEnvStore((env) => env.setPersonalAccessToken);
  const setProjectId = useEnvStore((env) => env.setProjectId);

  const [filters, setFilters] = useState<Filter[]>([]);
  const [copyTargets, setCopyTargets] = useState<DistributiveOmit<Filter, "value">[]>([]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log(filters);
    console.log(copyTargets);
    copyFilteredRows(personalAccessToken, projectId, filters, copyTargets);
  };

  return (
    <Container>
      <Link href="https://github.com/settings/tokens">PERSONAL_ACCESS_TOKEN設定リンク</Link>
      <Box component="section" sx={{ p: 2, border: "1px dashed grey", display: "flex", gap: "32px" }}>
        <TextField
          label="PERSONAL_ACCESS_TOKEN"
          variant="standard"
          value={personalAccessToken}
          onChange={(e) => setPersonalAccessToken(e.target.value)}
        />
        <TextField
          label="PROJECT_ID"
          variant="standard"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
      </Box>
      <form onSubmit={handleSubmit}>
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          <Button onClick={() => setFilters((prev) => [...prev, { key: "", value: "", type: "text" }])}>
            コピー条件の追加
          </Button>
          {filters.map((filter, index) => (
            <Box key={index} sx={{ display: "flex", gap: "8px" }}>
              <TextField
                label="field key"
                variant="standard"
                value={filter.key}
                onChange={(e) =>
                  setFilters((prev) => {
                    const newFilters = [...prev];
                    newFilters[index].key = e.target.value;
                    return newFilters;
                  })
                }
              />
              <TextField
                label="value"
                variant="standard"
                value={filter.value}
                onChange={(e) =>
                  setFilters((prev) => {
                    const newFilters = [...prev];
                    newFilters[index].value = e.target.value;
                    return newFilters;
                  })
                }
              />
              <Box>
                <InputLabel id={`filterSelect-${index}`}>field type</InputLabel>
                <Select
                  labelId={`filterSelect-${index}`}
                  value={filter.type}
                  onChange={(e) =>
                    setFilters((prev) => {
                      const newFilters = [...prev];
                      const newValue = e.target.value;
                      if (
                        newValue !== "text" &&
                        newValue !== "date" &&
                        newValue !== "number" &&
                        newValue !== "singleSelect" &&
                        newValue !== "iteration"
                      )
                        return prev;
                      newFilters[index].type = newValue;
                      return newFilters;
                    })
                  }
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="singleSelect">Single Select</MenuItem>
                  <MenuItem value="iteration">Iteration</MenuItem>
                </Select>
              </Box>
            </Box>
          ))}
        </Box>
        <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
          <Button onClick={() => setCopyTargets((prev) => [...prev, { key: "", type: "text" }])}>
            コピー対象の追加
          </Button>
          {copyTargets.map((copyTarget, index) => (
            <Box key={index} sx={{ display: "flex", gap: "8px" }}>
              <TextField
                label="field key"
                variant="standard"
                value={copyTarget.key}
                onChange={(e) =>
                  setCopyTargets((prev) => {
                    const newFilters = [...prev];
                    newFilters[index].key = e.target.value;
                    return newFilters;
                  })
                }
              />
              <Box>
                <InputLabel id={`copyTargetSelect-${index}`}>field type</InputLabel>
                <Select
                  labelId={`copyTargetSelect-${index}`}
                  value={copyTarget.type}
                  onChange={(e) =>
                    setCopyTargets((prev) => {
                      const newFilters = [...prev];
                      const newValue = e.target.value;
                      if (
                        newValue !== "text" &&
                        newValue !== "date" &&
                        newValue !== "number" &&
                        newValue !== "singleSelect" &&
                        newValue !== "iteration"
                      )
                        return prev;
                      newFilters[index].type = newValue;
                      return newFilters;
                    })
                  }
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="singleSelect">Single Select</MenuItem>
                  <MenuItem value="iteration">Iteration</MenuItem>
                </Select>
              </Box>
            </Box>
          ))}
        </Box>
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </form>
    </Container>
  );
}

export default App;
