import { useDeferredValue, useEffect, useState } from "react";
import { History, Search } from "lucide-react";
import type { TimelineRow } from "../types";
import { getTimelineItems } from "../utils/storage";
import { formatDate, formatRelative } from "../utils/format";
import { StateEmpty } from "./shared";

type Props = { refreshToken: number };

const TYPE_OPTIONS = ["all", "care", "finance", "legal", "tech", "task", "note"];

export function TimelinePage({ refreshToken }: Props) {
  const [items, setItems] = useState<TimelineRow[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const deferred = useDeferredValue(search);

  useEffect(() => {
    setItems(getTimelineItems());
  }, [refreshToken]);

  const needle = deferred.trim().toLowerCase();
  const visible = items.filter((item) => {
    const typeMatch = typeFilter === "all" || item.payload.type === typeFilter;
    if (!typeMatch) return false;

    if (!needle) return true;

    const haystack = [
      item.title,
      item.payload.summary,
      item.payload.rawText,
      item.payload.space,
      ...(item.payload.tags ?? []),
      item.payload.insight,
      ...(item.payload.linkedActions?.map((action) => action.title) ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Timeline</div>
          <h2>Saved captures and their follow-through.</h2>
          <p>Each entry should show what happened, how it was classified, which actions came from it, and the agent insight worth keeping.</p>
        </div>
      </section>

      <section className="card dense-card stack-md">
        <div className="filter-bar">
          <div className="search-wrap">
            <Search className="search-icon" size={16} />
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, summary, tags, insight, or action"
            />
          </div>

          <select className="filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All types" : option}
              </option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <StateEmpty icon={<History size={22} />} text="No timeline entries match the current filter." />
        ) : (
          <div className="stack-md">
            {visible.map((item) => (
              <article key={item.id} className="timeline-record">
                <div className="compact-row spread">
                  <strong>{item.title}</strong>
                  <span className="item-sub">{formatRelative(item.timestamp)}</span>
                </div>

                <div className="compact-text">{item.payload.summary ?? "No summary saved."}</div>

                <div className="item-meta">
                  <span className="badge badge-type">{item.payload.type ?? "note"}</span>
                  <span className="badge badge-open">{item.payload.priority ?? "low"}</span>
                  <span className="badge badge-bucket">{item.payload.space ?? item.bucket_code}</span>
                  <span className="item-sub">{formatDate(item.timestamp)}</span>
                </div>

                {(item.payload.tags ?? []).length > 0 ? (
                  <div className="item-meta">
                    {item.payload.tags?.map((tag) => (
                      <span key={tag} className="badge badge-bucket">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {item.payload.linkedActions && item.payload.linkedActions.length > 0 ? (
                  <div className="stack-xs">
                    <span className="form-label">Linked actions</span>
                    <div className="item-meta">
                      {item.payload.linkedActions.map((action) => (
                        <span key={action.id} className="badge badge-triaged">
                          {action.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.payload.insight ? (
                  <div className="insight-row">
                    <div className="compact-text">{item.payload.insight}</div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
