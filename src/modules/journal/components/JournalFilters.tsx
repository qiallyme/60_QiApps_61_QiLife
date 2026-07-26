import { useId } from "react";
import type { JournalFilters as JournalFilterValues } from "../services/journalSearch";

interface JournalFiltersProps {
  filters: JournalFilterValues;
  tags: readonly string[];
  onChange: (filters: JournalFilterValues) => void;
}

export function JournalFilters({ filters, tags, onChange }: JournalFiltersProps) {
  const fieldId = useId();

  return (
    <div className="journal-filters">
      <label htmlFor={`${fieldId}-search`}>
        <span className="qilife-optional">Search</span>
        <input
          id={`${fieldId}-search`}
          name="journalSearch"
          aria-label="Search journal"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search title, Markdown, tags…"
        />
      </label>
      <label htmlFor={`${fieldId}-tag`}>
        <span className="qilife-optional">Tag</span>
        <select
          id={`${fieldId}-tag`}
          name="journalTag"
          aria-label="Filter by tag"
          value={filters.tag ?? ""}
          onChange={(event) => onChange({ ...filters, tag: event.target.value || null })}
        >
          <option value="">All tags</option>
          {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </select>
      </label>
    </div>
  );
}
