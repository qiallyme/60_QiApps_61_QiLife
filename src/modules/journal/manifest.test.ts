import { describe, expect, it } from "vitest";
import { entityRegistry } from "../../features/qilife/data/entityRegistry";
import { journalModule } from "./manifest";

describe("journalModule", () => {
  it("declares URL-first Journal capabilities", () => {
    expect(journalModule.routes.map((route) => route.path)).toEqual([
      "/journal",
      "/journal/new",
      "/journal/:id",
    ]);
    expect(journalModule.recordTypes).toEqual(["journal_entry"]);
    expect(journalModule.navigation?.[0].to).toBe("/journal");
    expect(journalModule.commands?.[0].to).toBe("/journal/new");
    expect(journalModule.widgets?.[0].to).toBe("/journal");
  });

  it("aligns the shared Journal entity with Markdown record fields", () => {
    const journal = entityRegistry.journal_entry;
    expect(journal.fields.map((field) => field.key)).toEqual([
      "title",
      "entry_type",
      "entry_date",
      "thread",
      "body_markdown",
      "tags",
      "pinned",
    ]);
    expect(journal.dueDateField).toBeUndefined();
  });
});
