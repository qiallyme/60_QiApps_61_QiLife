import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RelationSelector } from "./RelationSelector";

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
