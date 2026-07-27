import type { JournalEntry } from "../types";
import { RecordList } from "../../../features/qilife/components/RecordList";

export function JournalList({ entries }: { entries: readonly JournalEntry[] }) {
  return (
    <RecordList
      ariaLabel="Journal entries"
      emptyMessage="No journal entries match these filters."
      items={entries.map((entry) => ({
        id: entry.id,
        entityKey: "journal_entry",
        title: entry.title,
        metadata: entry.pinned ? "Pinned" : undefined,
        dateLabel: `${entry.entryDate || "Undated"} · ${entry.tags.join(", ") || "No tags"}`,
        to: `/journal/${entry.id}`,
      }))}
    />
  );
}
