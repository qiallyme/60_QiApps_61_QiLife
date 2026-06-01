import { useLocation } from "react-router-dom";

const DOCK_MAP: Record<string, { title: string; bullets: string[] }> = {
  "/": {
    title: "Today Focus",
    bullets: [
      "Review pending draft before it goes stale.",
      "Close open actions with due hints first.",
      "Use the latest QiBits to decide the next move.",
    ],
  },
  "/capture": {
    title: "Capture Rules",
    bullets: [
      "Capture raw facts, not polished notes.",
      "Let the agent draft title, summary, tags, and actions.",
      "Keep one capture focused on one situation when possible.",
    ],
  },
  "/review": {
    title: "Approval Desk",
    bullets: [
      "Approve the draft fields you trust.",
      "Discard weak actions before save.",
      "Save writes the QiBit, actions, and timeline entry together.",
    ],
  },
  "/timeline": {
    title: "Timeline Spine",
    bullets: [
      "Timeline entries should show what changed, where, and why it matters.",
      "Linked actions should stay visible beside the saved QiBit.",
      "Recent entries are the shortest path back into context.",
    ],
  },
  "/actions": {
    title: "Action Layer",
    bullets: [
      "Actions come from saved captures, not separate brainstorming.",
      "Done/open state should be easy to update locally.",
      "Due hints stay attached to the source capture.",
    ],
  },
  "/knowledge": {
    title: "Knowledge Source",
    bullets: [
      "Repo docs in docs/ are the source of truth.",
      "The app should index those docs, not fork them.",
      "A backend docs endpoint is the missing integration step.",
    ],
  },
};

export function ContextDock() {
  const location = useLocation();
  const content = DOCK_MAP[location.pathname] ?? {
    title: "Working Notes",
    bullets: [
      "Keep the main loop dense and practical.",
      "Prefer saved state over decorative placeholders.",
      "Treat docs/ as the product knowledge base.",
    ],
  };

  return (
    <div className="dock-panel">
      <div className="dock-header">
        <div className="dock-kicker">Context</div>
        <div className="dock-title">{content.title}</div>
      </div>
      <div className="dock-body">
        <ul className="dock-list">
          {content.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
