import { FormEventHandler, useState } from "react";
import "./App.css";
import { Button, Container, Input, MenuItem, Select } from "@mui/material";

function App() {
  const [personalAccessToken, setPersonalAccessToken] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [filters, setFilters] = useState<
    {
      key: string;
      value: string;
      type: "text" | "date" | "number" | "singleSelect" | "iteration";
    }[]
  >([{ key: "name", value: "", type: "text" }]);
  const [copyTargets, setCopyTargets] = useState<
    {
      key: string;
      type: "text" | "date" | "number" | "singleSelect" | "iteration";
    }[]
  >([{ key: "name", type: "text" }]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log(filters);
    console.log(copyTargets);
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
