import type { JournalFilters as JournalFilterValues } from "../services/journalSearch";

interface JournalFiltersProps {
  filters: JournalFilterValues;
  tags: readonly string[];
  onChange: (filters: JournalFilterValues) => void;
}

export function JournalFilters({ filters, tags, onChange }: JournalFiltersProps) {
  return (
    <div className="journal-filters">
      <label>
        <span className="qilife-optional">Search</span>
        <input
          aria-label="Search journal"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search title, Markdown, tags…"
        />
      </label>
      <label>
        <span className="qilife-optional">Tag</span>
        <select
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
