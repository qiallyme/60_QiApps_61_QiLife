import type { JournalEntry } from "../types";

function quoted(value: string): string {
  return JSON.stringify(value);
}

export function buildJournalMarkdown(entry: JournalEntry): string {
  const frontMatter = [
    "---",
    `title: ${quoted(entry.title)}`,
    `entry_date: ${quoted(entry.entryDate)}`,
    `tags: ${JSON.stringify(entry.tags)}`,
    ...(entry.pinned ? ["pinned: true"] : []),
    `qilife_id: ${quoted(entry.id)}`,
    "---",
    "",
  ];

  return `${frontMatter.join("\n")}\n${entry.bodyMarkdown}`;
}

export function journalExportFilename(entry: JournalEntry): string {
  const slug = entry.title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return `${entry.entryDate || "undated"}-${slug || "journal-entry"}.md`;
}

export function downloadJournalMarkdown(entry: JournalEntry): void {
  const url = URL.createObjectURL(
    new Blob([buildJournalMarkdown(entry)], { type: "text/markdown;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = journalExportFilename(entry);
  anchor.click();
  URL.revokeObjectURL(url);
}
