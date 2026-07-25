import { Link } from "react-router-dom";
import type { JournalEntry } from "../types";

export function JournalList({ entries }: { entries: readonly JournalEntry[] }) {
  if (entries.length === 0) {
    return <div className="qilife-empty">No journal entries match these filters.</div>;
  }

  return (
    <div className="journal-list">
      {entries.map((entry) => (
        <Link className="journal-list-item" key={entry.id} to={`/journal/${entry.id}`}>
          <div>
            <strong>{entry.title}</strong>
            {entry.pinned && <span aria-label="Pinned"> · pinned</span>}
          </div>
          <small>{entry.entryDate || "Undated"} · {entry.tags.join(", ") || "No tags"}</small>
        </Link>
      ))}
    </div>
  );
}
