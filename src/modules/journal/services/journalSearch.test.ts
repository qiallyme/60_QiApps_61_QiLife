import { describe, expect, it } from "vitest";
import type { JournalEntry } from "../types";
import { filterJournalEntries } from "./journalSearch";

function entry(overrides: Partial<JournalEntry>): JournalEntry {
  return {
    id: "entry",
    title: "Entry",
    entryDate: "2026-07-24",
    bodyMarkdown: "",
    tags: [],
    pinned: false,
    ...overrides,
  };
}

const entries = [
  entry({
    id: "older-pinned",
    title: "Family Reflection",
    entryDate: "2026-07-22",
    bodyMarkdown: "A quiet day",
    tags: ["family"],
    pinned: true,
  }),
  entry({
    id: "newer",
    title: "Work Notes",
    entryDate: "2026-07-24",
    bodyMarkdown: "Shipped QiLife",
    tags: ["work", "qilife"],
  }),
];

describe("filterJournalEntries", () => {
  it("matches title, body, and tags case-insensitively", () => {
    expect(filterJournalEntries(entries, {
      query: "QILIFE",
      tag: null,
      entryDate: null,
    }).map((item) => item.id)).toEqual(["newer"]);
  });

  it("filters exact tag and date", () => {
    expect(filterJournalEntries(entries, {
      query: "",
      tag: "family",
      entryDate: "2026-07-22",
    }).map((item) => item.id)).toEqual(["older-pinned"]);
  });

  it("sorts pinned first and then newest date", () => {
    expect(filterJournalEntries(entries, {
      query: "",
      tag: null,
      entryDate: null,
    }).map((item) => item.id)).toEqual(["older-pinned", "newer"]);
  });
});
