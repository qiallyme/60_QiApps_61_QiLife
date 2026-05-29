import { useLocation } from "react-router-dom";

const DOCK_MAP: Record<string, { title: string; bullets: string[] }> = {
  "/": {
    title: "Today Context",
    bullets: [
      "Scheduled and due actions surface here first.",
      "Open loops and waiting_on items stay visible.",
      "Recent QiBits from the last 24 hours are shown.",
    ],
  },
  "/timeline": {
    title: "Timeline Doctrine",
    bullets: [
      "Projected from QiBits, Actions, Transactions, Events.",
      "QiBits use happened_at → captured_at → created_at.",
      "No separate timeline table — it's a live query.",
    ],
  },
  "/inbox": {
    title: "Inbox Review",
    bullets: [
      "Every item starts as a QiBit (status = new).",
      "AI suggestions stay staged until accepted.",
      "Triage routes to a bucket + optional thread.",
    ],
  },
  "/threads": {
    title: "Threads",
    bullets: [
      "Cases, projects, and storylines — not just tasks.",
      "Each thread groups the full situation.",
      "Status: open → active → closed.",
    ],
  },
  "/actions": {
    title: "Actions",
    bullets: [
      "Work orders derived from life events.",
      "Linked back to the source QiBit.",
      "Steps break actions into sub-tasks.",
    ],
  },
  "/people": {
    title: "People",
    bullets: [
      "Everyone connected to Cody's life operations.",
      "Linked to QiBits, threads, obligations.",
      "Relationship type shapes how context surfaces.",
    ],
  },
  "/calendar": {
    title: "Calendar",
    bullets: [
      "Events driven by the canonical event model.",
      "Linked to threads and QiBits by source_qibit_id.",
      "Coming in Phase 2.",
    ],
  },
  "/money": {
    title: "Money",
    bullets: [
      "Amounts stored in cents to avoid float errors.",
      "Obligations track who owes what.",
      "Linked to QiBits for full provenance.",
    ],
  },
  "/knowledge": {
    title: "Knowledge",
    bullets: [
      "Write once in Markdown, index everywhere.",
      "Repo docs are imported as read-only system items.",
      "Knowledge links to buckets, threads, people.",
    ],
  },
  "/documents": {
    title: "Documents",
    bullets: [
      "File metadata attached to QiBits and threads.",
      "file_hash ensures integrity checks.",
      "No cloud sync in v1 — local paths only.",
    ],
  },
  "/ask": {
    title: "Ask QiLife",
    bullets: [
      "Queries the full ledger with cited records.",
      "AI suggestions staged via ai_outputs table.",
      "Coming in Phase 5.",
    ],
  },
};

export function ContextDock() {
  const location = useLocation();
  const content = DOCK_MAP[location.pathname] ?? {
    title: "Context Dock",
    bullets: [
      "Knowledge appears next to the work it explains.",
      "Links express structure — tags aid retrieval.",
      "Repo docs become in-app knowledge later.",
    ],
  };

  return (
    <div className="dock-panel">
      <div className="dock-header">
        <div className="dock-kicker">Context Dock</div>
        <div className="dock-title">{content.title}</div>
      </div>
      <div className="dock-body">
        <div>
          <div className="dock-section-label">Relevant Knowledge</div>
          <ul className="dock-list">
            {content.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="dock-section-label">AI Layer</div>
          <ul className="dock-list">
            <li>Draft suggestions live in <code>ai_outputs</code> until approved.</li>
            <li>No silent writes to primary tables.</li>
          </ul>
        </div>
        <div>
          <div className="dock-section-label">Doctrine</div>
          <ul className="dock-list">
            <li>QiBit is atomic.</li>
            <li>Timeline is the spine.</li>
            <li>Context Dock embeds knowledge.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
