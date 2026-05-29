import { useApi } from "../hooks/use-api";
import type { Action } from "../types";

type ActionsPageProps = {
  refreshToken: number;
};

export function ActionsPage({ refreshToken }: ActionsPageProps) {
  const { data, loading, error } = useApi<Action[]>("/api/actions", [], refreshToken);

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <span className="section-tag">Actions</span>
        <h2>Work orders derived from real life.</h2>
      </section>

      <section className="panel-card">
        {loading ? <p className="state-copy">Loading actions...</p> : null}
        {error ? <p className="state-copy error-copy">{error}</p> : null}
        {data.map((action) => (
          <article key={action.id} className="timeline-item">
            <div>
              <span className="timeline-pill">{action.status}</span>
              <strong>{action.title}</strong>
              <p>{action.description}</p>
            </div>
            <span>{action.priority}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
