import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { JournalEntry } from "../types";
import { JournalList } from "./JournalList";

const entry: JournalEntry = {
  id: "entry-123",
  title: "A day worth keeping",
  entryDate: "2026-07-24",
  bodyMarkdown: "Body",
  tags: ["life"],
  pinned: true,
};

describe("JournalList", () => {
  it("links entries to their URL", () => {
    render(
      <MemoryRouter>
        <JournalList entries={[entry]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /A day worth keeping/ }))
      .toHaveAttribute("href", "/journal/entry-123");
  });

  it("renders an explicit empty state", () => {
    render(
      <MemoryRouter>
        <JournalList entries={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No journal entries match these filters.")).toBeInTheDocument();
  });
});
