type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <span className="section-tag">{title}</span>
        <h2>{title} module is scaffolded next.</h2>
        <p>{description}</p>
      </section>
    </div>
  );
}
