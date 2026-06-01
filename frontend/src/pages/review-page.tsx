import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import { Action, Draft, Priority, QiBit, QiBitType } from "../types";
import { clearPendingDraft, getPendingDraft, saveReviewResult } from "../utils/storage";
import { StateEmpty } from "./shared";

const TYPE_OPTIONS: Array<{ value: QiBitType; label: string }> = [
  { value: "care", label: "Care" },
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal" },
  { value: "tech", label: "Tech" },
  { value: "task", label: "Task" },
  { value: "note", label: "Note" },
];

const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];

type ReviewAction = Action & { kept: boolean };

type SaveResult = {
  qibit: QiBit;
  actionCount: number;
};

export function ReviewPage() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<QiBitType>("note");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [space, setSpace] = useState("General");
  const [actions, setActions] = useState<ReviewAction[]>([]);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  useEffect(() => {
    const pending = getPendingDraft();
    if (!pending) return;

    setDraft(pending);
    setTitle(pending.agentDraft.suggestedTitle);
    setType(pending.agentDraft.suggestedType);
    setSummary(pending.agentDraft.suggestedSummary);
    setTags(pending.agentDraft.suggestedTags.join(", "));
    setPriority(pending.agentDraft.suggestedPriority);
    setSpace(pending.agentDraft.suggestedSpace);
    setActions(pending.agentDraft.actions.map((action) => ({ ...action, kept: true })));
  }, []);

  function toggleAction(id: string) {
    setActions((current) => current.map((action) => (action.id === id ? { ...action, kept: !action.kept } : action)));
  }

  function updateActionField(id: string, updates: Partial<ReviewAction>) {
    setActions((current) => current.map((action) => (action.id === id ? { ...action, ...updates } : action)));
  }

  function handleDiscard() {
    clearPendingDraft();
    setDraft(null);
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;

    const now = new Date().toISOString();
    const finalQiBit: QiBit = {
      id: draft.id,
      createdAt: now,
      updatedAt: now,
      type,
      title: title.trim() || draft.agentDraft.suggestedTitle,
      summary: summary.trim() || draft.agentDraft.suggestedSummary,
      rawText: draft.rawText,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      priority,
      status: "saved",
      space: space.trim() || draft.agentDraft.suggestedSpace,
      agentDraft: draft.agentDraft,
      insight: draft.agentDraft.insight,
      source: draft.source,
    };

    const acceptedActions = actions
      .filter((action) => action.kept && action.title.trim())
      .map(({ kept, ...action }) => ({
        ...action,
        qibitId: finalQiBit.id,
        sourceText: draft.rawText,
        priority: action.priority || priority,
      }));

    saveReviewResult(finalQiBit, acceptedActions);
    setSaveResult({ qibit: finalQiBit, actionCount: acceptedActions.length });
    setDraft(null);
  }

  if (saveResult) {
    return (
      <div className="page-stack">
        <section className="desk-banner">
          <div>
            <div className="section-tag subdued">Saved</div>
            <h2>{saveResult.qibit.title}</h2>
            <p>
              Saved to local QiBits with {saveResult.actionCount} action{saveResult.actionCount === 1 ? "" : "s"} and a timeline entry.
            </p>
          </div>
        </section>

        <section className="card dense-card stack-md">
          <div className="compact-row spread">
            <span className="badge badge-type">{saveResult.qibit.type}</span>
            <span className="badge badge-open">{saveResult.qibit.priority}</span>
          </div>
          <div className="compact-text">{saveResult.qibit.summary}</div>
          <div className="action-row">
            <Link to="/" className="btn btn-primary">
              Go to Today
            </Link>
            <Link to="/timeline" className="btn btn-outline">
              Open Timeline
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="page-stack">
        <section className="desk-banner">
          <div>
            <div className="section-tag subdued">Review</div>
            <h2>Approval desk</h2>
            <p>No pending draft. Capture something first.</p>
          </div>
        </section>
        <div className="card dense-card">
          <StateEmpty icon={<CheckSquare size={28} />} text="No pending draft to review." />
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Review</div>
          <h2>Approve the draft.</h2>
          <p>Save commits the final QiBit, accepted actions, and one timeline entry.</p>
        </div>
      </section>

      <form className="two-col review-grid" onSubmit={handleSave}>
        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Raw Capture</span>
            <span className="card-count">{draft.source}</span>
          </div>
          <div className="raw-panel">{draft.rawText}</div>

          <div className="card-header">
            <span className="card-title">Agent Draft</span>
            <span className="card-count">{draft.agentDraft.confidence}</span>
          </div>

          <div className="stack-sm">
            <div className="compact-row spread">
              <span className="badge badge-type">{draft.agentDraft.suggestedType}</span>
              <span className="badge badge-open">{draft.agentDraft.suggestedPriority}</span>
            </div>
            <div className="stack-xs compact-text">
              <strong>{draft.agentDraft.suggestedTitle}</strong>
              <span>{draft.agentDraft.suggestedSummary}</span>
              <span>{draft.agentDraft.insight}</span>
            </div>
            <div className="item-meta">
              {draft.agentDraft.suggestedTags.map((tag) => (
                <span key={tag} className="badge badge-bucket">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="item-meta">
              {draft.agentDraft.detectedSignals.map((signal) => (
                <span key={signal} className="badge badge-triaged">
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Final QiBit</span>
            <span className="card-count">{actions.filter((action) => action.kept).length} actions kept</span>
          </div>

          <div>
            <label className="form-label">Title</label>
            <input className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="three-col">
            <div>
              <label className="form-label">Type</label>
              <select className="select-input" value={type} onChange={(event) => setType(event.target.value as QiBitType)}>
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select className="select-input" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Space</label>
              <input className="text-input" value={space} onChange={(event) => setSpace(event.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Summary</label>
            <textarea className="textarea-input" rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
          </div>

          <div>
            <label className="form-label">Tags</label>
            <input className="text-input" value={tags} onChange={(event) => setTags(event.target.value)} />
          </div>

          <div className="stack-sm">
            <div className="card-header">
              <span className="card-title">Generated Actions</span>
              <span className="card-count">{actions.length}</span>
            </div>

            {actions.length === 0 ? (
              <StateEmpty icon={<CheckSquare size={20} />} text="No actions extracted from this capture." />
            ) : (
              actions.map((action) => (
                <div key={action.id} className={`generated-action ${action.kept ? "" : "is-discarded"}`}>
                  <div className="compact-row spread">
                    <span className="badge badge-type">{action.priority}</span>
                    <button
                      type="button"
                      className={`btn btn-sm ${action.kept ? "btn-ghost" : "btn-outline"}`}
                      onClick={() => toggleAction(action.id)}
                    >
                      {action.kept ? "Discard" : "Keep"}
                    </button>
                  </div>
                  <input
                    className="text-input"
                    value={action.title}
                    onChange={(event) => updateActionField(action.id, { title: event.target.value })}
                    disabled={!action.kept}
                  />
                  <div className="compact-row">
                    <input
                      className="text-input"
                      value={action.dueHint ?? ""}
                      onChange={(event) => updateActionField(action.id, { dueHint: event.target.value || undefined })}
                      disabled={!action.kept}
                      placeholder="Due hint"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="action-row">
            <button type="button" className="btn btn-ghost" onClick={handleDiscard}>
              Discard Draft
            </button>
            <button type="submit" className="btn btn-primary">
              Save QiBit
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
