import type { ReactNode } from "react";

import { useApi } from "../hooks/use-api";
import type { Action, Qibit, TimelineRow } from "../types";

type TodayPageProps = {
  refreshToken: number;
};

export function TodayPage({ refreshToken }: TodayPageProps) {
  const actions = useApi<Action[]>("/api/actions", [], refreshToken);
  const qibits = useApi<Qibit[]>("/api/qibits", [], refreshToken);
  const timeline = useApi<TimelineRow[]>("/api/timeline", [], refreshToken);

  const scheduledActions = actions.data.filter((action) => action.scheduled_for || action.status === "waiting_on").slice(0, 4);
  const recentQibits = qibits.data.slice(0, 4);
  const recentTimeline = timeline.data.slice(0, 5);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <span className="section-tag">Today</span>
        <h2>Run life from the spine.</h2>
        <p>See scheduled work, open loops, recent QiBits, and the latest projected timeline signal in one command view.</p>
      </section>

      <div className="two-column-grid">
        <section className="panel-card">
          <h3>Due and Scheduled Actions</h3>
          <CollectionState loading={actions.loading} error={actions.error} empty="No scheduled actions yet.">
            {scheduledActions.map((action) => (
              <article key={action.id} className="ledger-item">
                <strong>{action.title}</strong>
                <span>{action.status}</span>
              </article>
            ))}
          </CollectionState>
        </section>

        <section className="panel-card">
          <h3>Recent QiBits</h3>
          <CollectionState loading={qibits.loading} error={qibits.error} empty="No QiBits captured yet.">
            {recentQibits.map((qibit) => (
              <article key={qibit.id} className="ledger-item">
                <strong>{qibit.title}</strong>
                <span>{qibit.bucket_code}</span>
              </article>
            ))}
          </CollectionState>
        </section>
      </div>

      <section className="panel-card">
        <h3>Timeline Snapshot</h3>
        <CollectionState loading={timeline.loading} error={timeline.error} empty="Timeline is empty.">
          {recentTimeline.map((row) => (
            <article key={`${row.record_type}-${row.id}`} className="timeline-item">
              <div>
                <strong>{row.title}</strong>
                <p>{row.record_type}</p>
              </div>
              <time>{new Date(row.timestamp).toLocaleString()}</time>
            </article>
          ))}
        </CollectionState>
      </section>
    </div>
  );
}

function CollectionState({
  loading,
  error,
  empty,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: string;
  children: ReactNode[];
}) {
  if (loading) {
    return <p className="state-copy">Loading...</p>;
  }
  if (error) {
    return <p className="state-copy error-copy">{error}</p>;
  }
  if (children.length === 0) {
    return <p className="state-copy">{empty}</p>;
  }
  return <>{children}</>;
}
