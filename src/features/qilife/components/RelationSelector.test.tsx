import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiRelationSelector, RelationSelector } from "./RelationSelector";

describe("RelationSelector", () => {
  it("displays record titles and emits stable IDs", async () => {
    const onChange = vi.fn();
    render(
      <RelationSelector
        relationEntity="project"
        value=""
        onChange={onChange}
        loadRecords={async () => [{
          id: "project-1",
          entity_key: "project",
          title: "Launch QiLife",
          data: {},
        }]}
      />,
    );

    await userEvent.selectOptions(
      await screen.findByRole("combobox"),
      "project-1",
    );
    expect(screen.getByRole("option", { name: "Launch QiLife" })).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("project-1");
  });

  it("keeps an unresolved legacy value visible and reports load errors", async () => {
    render(
      <RelationSelector
        relationEntity="project"
        value="Legacy Project"
        onChange={vi.fn()}
        loadRecords={async () => { throw new Error("offline"); }}
      />,
    );
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Unable to load Projects"));
    expect(screen.getByRole("option", { name: /Legacy Project/ })).toBeInTheDocument();
  });
});

describe("MultiRelationSelector", () => {
  it("adds and removes readable records while preserving unresolved legacy IDs", async () => {
    const onChange = vi.fn();
    render(
      <MultiRelationSelector
        relationEntity="person"
        values={["legacy-person"]}
        onChange={onChange}
        loadRecords={async () => [
          { id: "person-1", entity_key: "person", title: "Avery Stone", data: {} },
          { id: "person-2", entity_key: "person", title: "Jordan Lee", data: {} },
        ]}
      />,
    );

    expect(await screen.findByText("legacy-person (legacy value)")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByRole("combobox"), "person-1");
    expect(onChange).toHaveBeenLastCalledWith(["legacy-person", "person-1"]);

    await userEvent.click(screen.getByRole("button", { name: "Remove legacy-person" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
