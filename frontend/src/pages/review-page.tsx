import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingDraft, clearPendingDraft, addTimelineItem, saveActions } from "../utils/storage";
import { Action, Draft, TimelineRow } from "../types";
import { StateEmpty } from "./shared";
import { CheckSquare } from "lucide-react";

export function ReviewPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState("");
  const [bucket, setBucket] = useState("inbox");
  const [actions, setActions] = useState<(Action & { selected: boolean })[]>([]);

  useEffect(() => {
    const d = getPendingDraft();
    if (!d) return;
    
    setDraft(d);
    setTitle(d.suggestedTitle);
    setType(d.suggestedType);
    setSummary(d.suggestedSummary);
    setTags(d.suggestedTags.join(", "));
    setPriority(d.suggestedPriority);
    
    // Default bucket based on space if possible
    if (d.suggestedSpace === "Mom's Care") setBucket("areas");
    else if (d.suggestedSpace === "Finance") setBucket("areas");
    else if (d.suggestedSpace === "Projects") setBucket("projects");
    else setBucket("inbox");

    setActions(d.actions.map(a => ({ ...a, selected: true })));
  }, []);

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;

    const timelineId = draft.id;
    
    // Save accepted actions
    const acceptedActions = actions.filter(a => a.selected).map(a => {
      const { selected, ...actionData } = a;
      return { ...actionData, qibitId: timelineId };
    });
    
    if (acceptedActions.length > 0) {
      saveActions(acceptedActions);
    }

    const timelineItem: TimelineRow = {
      id: timelineId,
      record_type: type,
      title: title,
      timestamp: new Date().toISOString(),
      bucket_code: bucket,
      payload: {
        original_draft_id: draft.id,
        raw_text: draft.rawText,
        summary,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        priority,
        insight: draft.insight,
        linked_actions: acceptedActions.map(a => a.id)
      }
    };

    addTimelineItem(timelineItem);
    clearPendingDraft();
    navigate("/timeline");
  }

  function handleDiscard() {
    clearPendingDraft();
    setDraft(null);
    navigate("/");
  }

  function toggleAction(id: string) {
    setActions(actions.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  }

  function updateActionTitle(id: string, newTitle: string) {
    setActions(actions.map(a => a.id === id ? { ...a, title: newTitle } : a));
  }

  if (!draft) {
    return (
      <div className="page-stack">
        <section className="hero-panel compact-hero" style={{ borderLeft: "4px solid var(--accent-gold)" }}>
          <div className="section-tag" style={{ color: "var(--accent-gold)", background: "rgba(251, 191, 36, 0.1)" }}>Approval Desk</div>
          <h2>Review Queue</h2>
          <p>This is where agent-processed drafts await your approval before committing to the timeline.</p>
        </section>
        <div className="card">
          <StateEmpty icon={<CheckSquare size={32} />} text="No pending drafts to review. Go capture something!" />
        </div>
      </div>
    );
  }

  const confidenceColor = draft.confidence === "high" ? "var(--status-new)" : draft.confidence === "medium" ? "var(--status-triaged)" : "var(--status-waiting)";

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero" style={{ borderLeft: "4px solid var(--accent-gold)" }}>
        <div className="section-tag" style={{ color: "var(--accent-gold)", background: "rgba(251, 191, 36, 0.1)" }}>Approval Desk</div>
        <h2>Review Draft</h2>
        <p>The agent has structured your capture. Edit below before committing.</p>
      </section>

      <form className="card" onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: 16, background: "rgba(10, 132, 255, 0.05)", borderRadius: "var(--r-md)", marginBottom: 8, border: "1px dashed rgba(10, 132, 255, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="form-label" style={{ color: "var(--accent-blue)", margin: 0 }}>Agent Insight (v1 Mock)</span>
            <span style={{ fontSize: 11, color: "var(--ink-500)" }}>Confidence: <strong style={{ color: confidenceColor }}>{draft.confidence.toUpperCase()}</strong></span>
          </div>
          <div style={{ fontSize: 14, color: "var(--ink-700)", marginBottom: 12 }}>
            <em>"{draft.insight}"</em>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {draft.detectedSignals.map(s => (
              <span key={s} className="badge badge-triaged" style={{ fontSize: 10 }}>{s}</span>
            ))}
          </div>
        </div>

        {actions.length > 0 && (
          <div>
            <label className="form-label">Extracted Actions</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {actions.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "var(--r-sm)" }}>
                  <input type="checkbox" checked={a.selected} onChange={() => toggleAction(a.id)} style={{ width: 16, height: 16 }} />
                  <input 
                    className="text-input" 
                    style={{ flex: 1, padding: "6px 10px", background: "transparent", border: "1px solid transparent" }}
                    value={a.title}
                    onChange={(e) => updateActionTitle(a.id, e.target.value)}
                    disabled={!a.selected}
                  />
                  {a.dueHint && <span className="badge badge-open">{a.dueHint}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="form-label">Final Title</label>
          <input 
            className="text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="three-col">
          <div>
            <label className="form-label">Record Type</label>
            <select 
              className="select-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="qibits">QiBit / Note</option>
              <option value="actions">Action / Task</option>
              <option value="transactions">Transaction / Finance</option>
              <option value="events">Event / Legal</option>
              <option value="care">Health / Care</option>
            </select>
          </div>
          <div>
            <label className="form-label">Space</label>
            <select 
              className="select-input"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
            >
              <option value="inbox">Inbox</option>
              <option value="projects">Projects</option>
              <option value="areas">Areas</option>
              <option value="resources">Resources</option>
              <option value="archive">Archive</option>
            </select>
          </div>
          <div>
            <label className="form-label">Priority</label>
            <select 
              className="select-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Summary</label>
          <textarea
            className="textarea-input"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <label className="form-label">Tags (comma separated)</label>
          <input 
            className="text-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div style={{ padding: 12, background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--r-md)", border: "1px dashed rgba(255, 255, 255, 0.15)" }}>
          <div className="form-label" style={{ marginBottom: 4 }}>Original Raw Text</div>
          <div style={{ fontSize: 13, whiteSpace: "pre-wrap", color: "var(--ink-500)" }}>{draft.rawText}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <button 
            type="button"
            className="btn btn-ghost" 
            onClick={handleDiscard}
          >
            Discard
          </button>
          <button 
            type="submit"
            className="btn btn-primary" 
          >
            Save to Timeline
          </button>
        </div>
      </form>
    </div>
  );
}
