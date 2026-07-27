import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecordList } from "./RecordList";
import { RecordRow } from "./RecordRow";

describe("RecordRow", () => {
  it("renders a linked record row with metadata and status", () => {
    render(
      <MemoryRouter>
        <RecordRow
          entityKey="task"
          title="Draft project brief"
          metadata="Project: Apollo"
          status="In progress"
          priority="High"
          dateLabel="Due today"
          to="/actions/act_1"
        />
      </MemoryRouter>,
    );

    const row = screen.getByRole("link", { name: /draft project brief/i });
    expect(row).toHaveAttribute("href", "/actions/act_1");
    expect(screen.getByText("Project: Apollo")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Due today")).toBeInTheDocument();
  });
});

describe("RecordList", () => {
  it("shows an empty message when there are no records", () => {
    render(<RecordList ariaLabel="Actions" emptyMessage="No actions yet." items={[]} />);

    expect(screen.getByText("No actions yet.")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Actions" })).toBeInTheDocument();
  });
});
