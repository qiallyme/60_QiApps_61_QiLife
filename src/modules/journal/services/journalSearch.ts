import type { JournalEntry } from "../types";

export interface JournalFilters {
  query: string;
  tag: string | null;
  entryDate: string | null;
}

export function filterJournalEntries(
  entries: readonly JournalEntry[],
  filters: JournalFilters,
): JournalEntry[] {
  const query = filters.query.trim().toLowerCase();

  return entries
    .filter((entry) => !filters.tag || entry.tags.includes(filters.tag))
    .filter((entry) => !filters.entryDate || entry.entryDate === filters.entryDate)
    .filter((entry) => {
      if (!query) return true;
      return [
        entry.title,
        entry.bodyMarkdown,
        entry.entryDate,
        ...entry.tags,
      ].some((value) => value.toLowerCase().includes(query));
    })
    .sort(
      (left, right) =>
        Number(right.pinned) - Number(left.pinned)
        || right.entryDate.localeCompare(left.entryDate)
        || right.title.localeCompare(left.title),
    );
}
