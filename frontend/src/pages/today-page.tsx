import { useApi } from "../hooks/use-api";
import type { Action, Qibit, TimelineRow } from "../types";
import { StatusBadge, PriorityBadge, StateEmpty, StateLoading, StateError } from "./shared";
import { formatDate, formatRelative } from "../utils/format";

type Props = { refreshToken: number };

export function TodayPage({ refreshToken }: Props) {
  const actions  = useApi<Action[]>("/api/actions", [], refreshToken);
  const qibits   = useApi<Qibit[]>("/api/qibits", [], refreshToken);
  const timeline = useApi<TimelineRow[]>("/api/timeline", [], refreshToken);

  const today = new Date().toDateString();
  const dueActions = actions.data.filter(
    (a) => a.status !== "completed" && (a.scheduled_for || a.status === "waiting_on")
  ).slice(0, 5);

  const recentQibits = qibits.data.slice(0, 5);
  const openLoops = actions.data.filter(
    (a) => a.status === "waiting_on"
  ).slice(0, 4);
  const recentTimeline = timeline.data.slice(0, 6);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="section-tag">Today · {today}</div>
        <h2>Run life from the spine.</h2>
        <p>
          Scheduled work, open loops, recent QiBits, and the live timeline signal in one
          command view. Capture anything below.
        </p>
      </section>

      <div className="two-col">
        {/* Due & Scheduled */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Due &amp; Scheduled</span>
            <span className="card-count">{dueActions.length}</span>
          </div>
          {actions.loading && <StateLoading />}
          {actions.error && <StateError message={actions.error} />}
          {!actions.loading && dueActions.length === 0 && (
            <StateEmpty icon="✓" text="No scheduled actions today." />
          )}
          {dueActions.map((a) => (
            <div key={a.id} className="item-row">
              <div className="item-main">
                <div className="item-title">{a.title}</div>
                {a.scheduled_for && (
                  <div className="item-sub">{formatDate(a.scheduled_for)}</div>
                )}
                <div className="item-meta">
                  <StatusBadge status={a.status} />
                  <PriorityBadge priority={a.priority} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent QiBits */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent QiBits</span>
            <span className="card-count">{qibits.data.length}</span>
          </div>
          {qibits.loading && <StateLoading />}
          {qibits.error && <StateError message={qibits.error} />}
          {!qibits.loading && recentQibits.length === 0 && (
            <StateEmpty icon="◈" text="No QiBits yet. Capture one below." />
          )}
          {recentQibits.map((q) => (
            <div key={q.id} className="item-row">
              <div className="item-main">
                <div className="item-title">{q.title}</div>
                <div className="item-sub" style={{ marginBottom: 4 }}>
                  {q.raw_capture.length > 80
                    ? q.raw_capture.slice(0, 80) + "…"
                    : q.raw_capture}
                </div>
                <div className="item-meta">
                  <StatusBadge status={q.status} />
                  <span className="badge badge-bucket">B{q.bucket_code}</span>
                  <span className="item-sub">{formatRelative(q.captured_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Loops */}
      {openLoops.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">⏳ Open Loops — Waiting On</span>
            <span className="card-count">{openLoops.length}</span>
          </div>
          {openLoops.map((a) => (
            <div key={a.id} className="item-row">
              <div className="item-main">
                <div className="item-title">{a.title}</div>
                {a.description && <div className="item-sub">{a.description}</div>}
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      )}

      {/* Timeline Snapshot */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Timeline Snapshot</span>
          <span className="card-count">{timeline.data.length} entries</span>
        </div>
        {timeline.loading && <StateLoading />}
        {timeline.error && <StateError message={timeline.error} />}
        {!timeline.loading && recentTimeline.length === 0 && (
          <StateEmpty icon="◈" text="Timeline is empty. Start capturing." />
        )}
        {recentTimeline.map((row) => (
          <TimelineEntry key={`${row.record_type}-${row.id}`} row={row} />
        ))}
      </div>
    </div>
  );
}

function TimelineEntry({ row }: { row: TimelineRow }) {
  const icons: Record<string, string> = {
    qibits: "◈",
    actions: "◷",
    transactions: "◉",
    events: "◻",
    daily_summaries: "≡",
  };
  return (
    <div className="timeline-entry">
      <div className={`timeline-icon timeline-icon-${row.record_type}`}>
        {icons[row.record_type] ?? "◆"}
      </div>
      <div className="timeline-body">
        <div className="item-title">{row.title}</div>
        <div className="item-meta">
          <span className="badge badge-type">{row.record_type.replace("_", " ")}</span>
          <span className="badge badge-bucket">B{row.bucket_code}</span>
        </div>
      </div>
      <div className="timeline-time">{formatRelative(row.timestamp)}</div>
    </div>
  );
}
