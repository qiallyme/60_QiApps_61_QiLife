type Props = { title: string; description: string; phase?: string };

export function PlaceholderPage({ title, description, phase = "upcoming" }: Props) {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="section-tag">{title}</div>
        <h2>{title}</h2>
        <p>{description}</p>
        <div style={{ marginTop: 16 }}>
          <span
            className="badge"
            style={{
              background: "rgba(49,86,65,0.1)",
              color: "var(--forest-600)",
              fontSize: 12,
              padding: "4px 12px",
            }}
          >
            Phase: {phase}
          </span>
        </div>
      </section>

      <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.25 }}>◆</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-600, var(--ink-700))", marginBottom: 8 }}>
          Coming up in {phase}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-400)", maxWidth: 380, margin: "0 auto" }}>
          {description}
        </div>
      </div>
    </div>
  );
}
