import { useApi } from "../hooks/use-api";
import type { Qibit } from "../types";

type InboxPageProps = {
  refreshToken: number;
};

export function InboxPage({ refreshToken }: InboxPageProps) {
  const { data, loading, error } = useApi<Qibit[]>("/api/qibits", [], refreshToken);
  const inboxQibits = data.filter((qibit) => qibit.status === "new");

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <span className="section-tag">Inbox</span>
        <h2>Chaos catcher for unprocessed QiBits.</h2>
      </section>

      <section className="panel-card">
        {loading ? <p className="state-copy">Loading inbox...</p> : null}
        {error ? <p className="state-copy error-copy">{error}</p> : null}
        {inboxQibits.length === 0 && !loading ? <p className="state-copy">No unprocessed QiBits.</p> : null}
        {inboxQibits.map((qibit) => (
          <article key={qibit.id} className="qibit-card">
            <div>
              <span className="timeline-pill">new</span>
              <strong>{qibit.title}</strong>
              <p>{qibit.raw_capture}</p>
            </div>
            <small>Bucket {qibit.bucket_code}</small>
          </article>
        ))}
      </section>
    </div>
  );
}
