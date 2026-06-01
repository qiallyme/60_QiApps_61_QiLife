import { KeyboardEvent, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpDown, History, Search, ZoomIn } from "lucide-react";
import type { TimelineRow } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getTimelineItems } from "../utils/storage";
import { StateEmpty } from "./shared";

type Props = { refreshToken: number };
type SortOrder = "newest" | "oldest";
type ZoomMode = "compact" | "normal" | "expanded";

const TYPE_OPTIONS = ["all", "care", "finance", "legal", "tech", "task", "note"];
const ZOOM_OPTIONS: ZoomMode[] = ["compact", "normal", "expanded"];

export function TimelinePage({ refreshToken }: Props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<TimelineRow[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") ?? "all");
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get("sort") as SortOrder) || "newest");
  const [zoom, setZoom] = useState<ZoomMode>((searchParams.get("zoom") as ZoomMode) || "normal");
  const [spaceFilter, setSpaceFilter] = useState(searchParams.get("space") ?? "");
  const [tagFilter, setTagFilter] = useState(searchParams.get("tag") ?? "");
  const deferred = useDeferredValue(search);

  useEffect(() => {
    setItems(getTimelineItems());
  }, [refreshToken]);

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setTypeFilter(searchParams.get("type") ?? "all");
    setSortOrder((searchParams.get("sort") as SortOrder) || "newest");
    setZoom((searchParams.get("zoom") as ZoomMode) || "normal");
    setSpaceFilter(searchParams.get("space") ?? "");
    setTagFilter(searchParams.get("tag") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams();
    const needle = search.trim();

    if (needle) next.set("q", needle);
    if (typeFilter !== "all") next.set("type", typeFilter);
    if (sortOrder !== "newest") next.set("sort", sortOrder);
    if (zoom !== "normal") next.set("zoom", zoom);
    if (spaceFilter) next.set("space", spaceFilter);
    if (tagFilter) next.set("tag", tagFilter);

    const nextString = next.toString();
    const currentString = searchParams.toString();
    if (nextString !== currentString) {
      setSearchParams(next, { replace: true });
    }
  }, [search, searchParams, setSearchParams, sortOrder, spaceFilter, tagFilter, typeFilter, zoom]);

  const needle = deferred.trim().toLowerCase();
  const visible = useMemo(() => {
    const filtered = items.filter((item) => {
      const typeMatch = typeFilter === "all" || item.payload.type === typeFilter;
      const spaceMatch = !spaceFilter || item.payload.space === spaceFilter || item.bucket_code === spaceFilter;
      const tagMatch = !tagFilter || (item.payload.tags ?? []).includes(tagFilter);

      if (!typeMatch || !spaceMatch || !tagMatch) return false;

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

    return filtered.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [items, needle, sortOrder, spaceFilter, tagFilter, typeFilter]);

  const groups = useMemo(() => {
    const grouped = new Map<string, TimelineRow[]>();
    for (const item of visible) {
      const key = formatDate(item.timestamp);
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }
    return Array.from(grouped.entries()).map(([label, rows]) => ({ label, rows }));
  }, [visible]);

  const hasScopedFilter = spaceFilter || tagFilter;

  function openQiBit(item: TimelineRow) {
    navigate(`/qibits/${item.payload.qibitId ?? item.id}`);
  }

  function handleCardKey(event: KeyboardEvent<HTMLElement>, item: TimelineRow) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openQiBit(item);
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Timeline</div>
          <h2>Event stream</h2>
          <p>Follow captures, priorities, actions, and agent insight as one linked record stream.</p>
        </div>
      </section>

      <section className="card dense-card stack-md">
        <div className="filter-bar timeline-toolbar">
          <div className="search-wrap">
            <Search className="search-icon" size={16} />
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, summary, raw text, tags, insight, or action"
            />
          </div>

          <div className="filter-chip-row">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`filter-chip ${typeFilter === option ? "is-active" : ""}`}
                onClick={() => setTypeFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-bar timeline-toolbar">
          <div className="filter-chip-row">
            <button
              type="button"
              className={`filter-chip ${sortOrder === "newest" ? "is-active" : ""}`}
              onClick={() => setSortOrder("newest")}
            >
              <ArrowUpDown size={14} />
              Newest
            </button>
            <button
              type="button"
              className={`filter-chip ${sortOrder === "oldest" ? "is-active" : ""}`}
              onClick={() => setSortOrder("oldest")}
            >
              <ArrowUpDown size={14} />
              Oldest
            </button>
            {ZOOM_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`filter-chip ${zoom === option ? "is-active" : ""}`}
                onClick={() => setZoom(option)}
              >
                <ZoomIn size={14} />
                {option}
              </button>
            ))}
          </div>

          {hasScopedFilter ? (
            <div className="filter-chip-row">
              {spaceFilter ? (
                <button type="button" className="filter-chip is-active" onClick={() => setSpaceFilter("")}>
                  space: {spaceFilter}
                </button>
              ) : null}
              {tagFilter ? (
                <button type="button" className="filter-chip is-active" onClick={() => setTagFilter("")}>
                  tag: #{tagFilter}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {visible.length === 0 ? (
          <StateEmpty icon={<History size={22} />} text="No timeline entries match the current filter." />
        ) : (
          <div className={`timeline-stream timeline-${zoom}`}>
            {groups.map((group) => (
              <section key={group.label} className="timeline-group">
                <div className="timeline-group-label">{group.label}</div>
                <div className="timeline-group-list">
                  {group.rows.map((item) => (
                    <article key={item.id} className={`timeline-entry timeline-entry-${zoom}`}>
                      <div className={`timeline-node timeline-node-${item.payload.priority ?? "low"}`} />
                      <div
                        className="timeline-entry-card interactive-card"
                        role="link"
                        tabIndex={0}
                        onClick={() => openQiBit(item)}
                        onKeyDown={(event) => handleCardKey(event, item)}
                      >
                        <div className="compact-row spread">
                          <div className="stack-xs">
                            <strong>{item.title}</strong>
                            <span className="compact-text">{item.payload.summary ?? "No summary saved."}</span>
                          </div>
                          <span className="item-sub">{formatRelative(item.timestamp)}</span>
                        </div>

                        <div className="item-meta">
                          <span className="badge badge-type">{item.payload.type ?? "note"}</span>
                          <span className={`badge badge-${item.payload.priority ?? "low"}`}>{item.payload.priority ?? "low"}</span>
                          <span className="badge badge-bucket">{item.payload.space ?? item.bucket_code}</span>
                        </div>

                        {zoom !== "compact" && (item.payload.tags ?? []).length > 0 ? (
                          <div className="item-meta">
                            {item.payload.tags?.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className="chip-link"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setTagFilter(tag);
                                }}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {item.payload.linkedActions && item.payload.linkedActions.length > 0 ? (
                          <div className="stack-xs">
                            <span className="form-label">Linked actions</span>
                            <div className="item-meta">
                              {item.payload.linkedActions.map((action) => (
                                <Link
                                  key={action.id}
                                  to={`/actions/${action.id}`}
                                  className="chip-link"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  {action.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {zoom === "expanded" ? (
                          <div className="stack-sm">
                            {item.payload.rawText ? <div className="raw-panel timeline-raw">{item.payload.rawText}</div> : null}
                            {item.payload.insight ? (
                              <div className="insight-row">
                                <div className="compact-text">{item.payload.insight}</div>
                              </div>
                            ) : null}
                            <div className="compact-row spread">
                              <span className="item-sub">{formatDate(item.timestamp)}</span>
                              <Link
                                to={`/qibits/${item.payload.qibitId ?? item.id}`}
                                className="inline-link"
                                onClick={(event) => event.stopPropagation()}
                              >
                                Open record
                              </Link>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
