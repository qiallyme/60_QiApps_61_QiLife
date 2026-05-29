import { useDeferredValue, useState } from "react";
import { useApi } from "../hooks/use-api";
import type { TimelineRow } from "../types";
import { StateEmpty, StateLoading, StateError } from "./shared";
import { formatRelative } from "../utils/format";

type Props = { refreshToken: number };

const TYPE_ICONS: Record<string, string> = {
  qibits: "◈",
  actions: "◷",
  transactions: "◉",
  events: "◻",
  daily_summaries: "≡",
};

const TYPE_OPTIONS = ["all", "qibits", "actions", "transactions", "events", "daily_summaries"];

export function TimelinePage({ refreshToken }: Props) {
  const { data, loading, error } = useApi<TimelineRow[]>("/api/timeline", [], refreshToken);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const deferred = useDeferredValue(search);

  const needle = deferred.trim().toLowerCase();
  const visible = data
    .filter((r) => typeFilter === "all" || r.record_type === typeFilter)
    .filter((r) =>
      !needle ||
      r.title.toLowerCase().includes(needle) ||
      r.bucket_code.includes(needle)
    );

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="section-tag">Timeline</div>
        <h2>Chronological truth across the whole desk.</h2>
        <p>QiBits, actions, transactions, events, and daily summaries projected in one unified feed.</p>
      </section>

      <div className="card">
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or bucket…"
            />
          </div>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All types" : t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {loading && <StateLoading />}
        {error && <StateError message={error} />}
        {!loading && visible.length === 0 && (
          <StateEmpty icon="◈" text="No timeline entries match your filter." />
        )}

        {visible.map((row) => (
          <div key={`${row.record_type}-${row.id}`} className="timeline-entry">
            <div className={`timeline-icon timeline-icon-${row.record_type}`}>
              {TYPE_ICONS[row.record_type] ?? "◆"}
            </div>
            <div className="timeline-body">
              <div className="item-title">{row.title}</div>
              <div className="item-meta">
                <span className="badge badge-type">{row.record_type.replace("_", " ")}</span>
                <span className="badge badge-bucket">Bucket {row.bucket_code}</span>
              </div>
            </div>
            <div className="timeline-time">{formatRelative(row.timestamp)}</div>
          </div>
        ))}

        {!loading && (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-300)", textAlign: "right" }}>
            {visible.length} of {data.length} entries
          </div>
        )}
      </div>
    </div>
  );
}
