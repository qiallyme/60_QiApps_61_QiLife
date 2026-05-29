import { useDeferredValue, useState } from "react";

import { useApi } from "../hooks/use-api";
import type { TimelineRow } from "../types";

type TimelinePageProps = {
  refreshToken: number;
};

export function TimelinePage({ refreshToken }: TimelinePageProps) {
  const { data, loading, error } = useApi<TimelineRow[]>("/api/timeline", [], refreshToken);
  const [filter, setFilter] = useState("");
  const deferredFilter = useDeferredValue(filter);

  const needle = deferredFilter.trim().toLowerCase();
  const visibleRows = !needle
    ? data
    : data.filter((row) => `${row.title} ${row.record_type} ${row.bucket_code}`.toLowerCase().includes(needle));

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <span className="section-tag">Timeline</span>
        <h2>Chronological truth across the whole desk.</h2>
      </section>

      <section className="panel-card">
        <div className="filter-row">
          <input
            className="text-input"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter by title, bucket, or record type"
          />
        </div>

        {loading ? <p className="state-copy">Loading timeline...</p> : null}
        {error ? <p className="state-copy error-copy">{error}</p> : null}

        <div className="timeline-list">
          {visibleRows.map((row) => (
            <article key={`${row.record_type}-${row.id}`} className="timeline-item">
              <div>
                <span className="timeline-pill">{row.record_type}</span>
                <strong>{row.title}</strong>
                <p>Bucket {row.bucket_code}</p>
              </div>
              <time>{new Date(row.timestamp).toLocaleString()}</time>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
