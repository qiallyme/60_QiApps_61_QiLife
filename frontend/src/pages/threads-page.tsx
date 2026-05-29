import { useApi } from "../hooks/use-api";
import type { Thread } from "../types";

type ThreadsPageProps = {
  refreshToken: number;
};

export function ThreadsPage({ refreshToken }: ThreadsPageProps) {
  const { data, loading, error } = useApi<Thread[]>("/api/threads", [], refreshToken);

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <span className="section-tag">Threads</span>
        <h2>Cases, projects, and storylines.</h2>
      </section>

      <section className="panel-card">
        {loading ? <p className="state-copy">Loading threads...</p> : null}
        {error ? <p className="state-copy error-copy">{error}</p> : null}
        <div className="card-grid">
          {data.map((thread) => (
            <article key={thread.id} className="module-card">
              <span className="timeline-pill">{thread.status}</span>
              <h3>{thread.title}</h3>
              <p>{thread.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
