import { Link } from "react-router-dom";

export function JournalWidget({ to }: { to: string }) {
  return (
    <article className="qilife-panel journal-widget">
      <div className="qilife-panel-head">
        <div>
          <div className="qilife-eyebrow">JOURNAL</div>
          <h3>Write what happened</h3>
        </div>
        <Link to={to}>Open Journal</Link>
      </div>
      <p>Capture a Markdown reflection in the shared Life Record.</p>
      <Link className="qilife-btn primary" to="/journal/new">Quick journal</Link>
    </article>
  );
}
