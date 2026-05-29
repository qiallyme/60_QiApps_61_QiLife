import { useApi } from "../hooks/use-api";
import type { Person } from "../types";

type PeoplePageProps = {
  refreshToken: number;
};

export function PeoplePage({ refreshToken }: PeoplePageProps) {
  const { data, loading, error } = useApi<Person[]>("/api/people", [], refreshToken);

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <span className="section-tag">People</span>
        <h2>Who is involved and what is the history?</h2>
      </section>

      <section className="panel-card">
        {loading ? <p className="state-copy">Loading people...</p> : null}
        {error ? <p className="state-copy error-copy">{error}</p> : null}
        <div className="card-grid">
          {data.map((person) => (
            <article key={person.id} className="module-card">
              <span className="timeline-pill">{person.type}</span>
              <h3>{person.display_name}</h3>
              <p>{person.relationship}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
