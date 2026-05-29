import { useLocation } from "react-router-dom";

const dockContent: Record<string, { title: string; bullets: string[] }> = {
  "/": {
    title: "Today Context",
    bullets: [
      "Show what matters right now.",
      "Keep open loops and obligations visible.",
      "Separate daily summaries from raw activity history.",
    ],
  },
  "/timeline": {
    title: "Timeline Doctrine",
    bullets: [
      "Timeline is projected from multiple tables.",
      "QiBits use happened_at, captured_at, or created_at.",
      "Daily summaries are distinct from activity log rows.",
    ],
  },
  "/inbox": {
    title: "Inbox Review",
    bullets: [
      "Every important item starts as a QiBit.",
      "AI suggestions stay staged until approved.",
      "Triaged items should route to a bucket and optional thread.",
    ],
  },
};

export function ContextDock() {
  const location = useLocation();
  const content = dockContent[location.pathname] ?? {
    title: "Context Dock",
    bullets: [
      "Repo docs become read-only in-app knowledge later.",
      "Links express known structure.",
      "Tags help retrieval but do not replace links.",
    ],
  };

  return (
    <div className="dock-panel">
      <div className="dock-section">
        <span className="dock-label">Context Dock</span>
        <h2>{content.title}</h2>
      </div>

      <div className="dock-section">
        <h3>Relevant Knowledge</h3>
        <ul className="dock-list">
          {content.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>

      <div className="dock-section">
        <h3>AI Layer</h3>
        <p>Draft suggestions belong in `ai_outputs` until Cody approves them.</p>
      </div>
    </div>
  );
}
