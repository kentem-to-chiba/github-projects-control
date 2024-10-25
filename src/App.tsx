import { FormEventHandler, useState } from "react";
import "./App.css";
import { Button, Container, Input, MenuItem, Select } from "@mui/material";
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

  // const [personalAccessToken, setPersonalAccessToken] = useState<string>("");
  // const [projectId, setProjectId] = useState<string>("");
  const [filters, setFilters] = useState<Filter[]>([{ key: "name", value: "", type: "text" }]);
  const [copyTargets, setCopyTargets] = useState<DistributiveOmit<Filter, "value">[]>([]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log(filters);
    console.log(copyTargets);
    copyFilteredRows(personalAccessToken, projectId, filters, copyTargets);
  };

  return (
    <Container>
      <Input
        placeholder="PERSONAL_ACCESS_TOKEN"
        value={personalAccessToken}
        onChange={(e) => setPersonalAccessToken(e.target.value)}
      />
      <Input placeholder="PROJECT_ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
      <form onSubmit={handleSubmit}>
        <Button onClick={() => setFilters((prev) => [...prev, { key: "", value: "", type: "text" }])}>Add</Button>
        {filters.map((filter, index) => (
          <div key={index}>
            <Input
              value={filter.key}
              onChange={(e) =>
                setFilters((prev) => {
                  const newFilters = [...prev];
                  newFilters[index].key = e.target.value;
                  return newFilters;
                })
              }
              placeholder="field key"
            />
            <Input
              value={filter.value}
              onChange={(e) =>
                setFilters((prev) => {
                  const newFilters = [...prev];
                  newFilters[index].value = e.target.value;
                  return newFilters;
                })
              }
              placeholder="value"
            />
            <Select
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
              placeholder="field type"
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="singleSelect">Single Select</MenuItem>
              <MenuItem value="iteration">Iteration</MenuItem>
            </Select>
          </div>
        ))}
        <Button onClick={() => setCopyTargets((prev) => [...prev, { key: "", type: "text" }])}>Add</Button>
        {copyTargets.map((filter, index) => (
          <div key={index}>
            <Input
              value={filter.key}
              onChange={(e) =>
                setCopyTargets((prev) => {
                  const newFilters = [...prev];
                  newFilters[index].key = e.target.value;
                  return newFilters;
                })
              }
            />
            <Select
              value={filter.type}
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
          </div>
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Container>
  );
}

export default App;
