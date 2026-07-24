import { describe, expect, it } from "vitest";
import type { JournalEntry } from "../types";
import { buildJournalMarkdown, journalExportFilename } from "./markdownExport";

const entry: JournalEntry = {
  id: "journal-123",
  title: 'A "Quoted" Day',
  entryDate: "2026-07-24",
  bodyMarkdown: "# Exact\n\n- unchanged",
  tags: ["life", "qilife"],
  pinned: true,
};

describe("Journal Markdown export", () => {
  it("preserves the exact body after stable front matter", () => {
    expect(buildJournalMarkdown(entry)).toBe(
      [
        "---",
        'title: "A \\"Quoted\\" Day"',
        'entry_date: "2026-07-24"',
        'tags: ["life","qilife"]',
        "pinned: true",
        'qilife_id: "journal-123"',
        "---",
        "",
        "# Exact",
        "",
        "- unchanged",
      ].join("\n"),
    );
  });

  it("creates a stable sanitized filename", () => {
    expect(journalExportFilename(entry)).toBe("2026-07-24-a-quoted-day.md");
  });
});
