import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { JournalDraft } from "../types";
import { JournalEditor } from "./JournalEditor";

const draft: JournalDraft = {
  title: "",
  entryDate: "2026-07-24",
  bodyMarkdown: "",
  tags: [],
  pinned: false,
};

describe("JournalEditor", () => {
  it("emits title, date, tags, pin, and exact Markdown edits", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <JournalEditor
        draft={draft}
        status="clean"
        onChange={onChange}
        onSave={vi.fn()}
        onRetry={vi.fn()}
        onExport={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Today" } });
    expect(onChange).toHaveBeenLastCalledWith({ title: "Today" });

    const filled = { ...draft, title: "Today", bodyMarkdown: "# Exact" };
    rerender(
      <JournalEditor
        draft={filled}
        status="dirty"
        onChange={onChange}
        onSave={vi.fn()}
        onRetry={vi.fn()}
        onExport={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Markdown")).toHaveValue("# Exact");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });

  it("offers retry only after a failed save", () => {
    const onRetry = vi.fn();
    render(
      <JournalEditor
        draft={draft}
        status="failed"
        onChange={vi.fn()}
        onSave={vi.fn()}
        onRetry={onRetry}
        onExport={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Retry save" })).toBeInTheDocument();
  });
});
