import { useState } from "react";
import { RelationSelector } from "../../../features/qilife/components/RelationSelector";
import type { ActionDraft } from "../types";

export const emptyAction: ActionDraft = {
  title: "", status: "inbox", priority: "medium", dueDate: null,
  projectId: null, peopleIds: [], threadId: null, context: "", notes: "",
};

export function ActionForm({
  initial = emptyAction,
  onSave,
  onCancel,
}: {
  initial?: ActionDraft;
  onSave: (draft: ActionDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof ActionDraft>(key: K, value: ActionDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return setError("Action title is required.");
    setSaving(true);
    setError("");
    try { await onSave(draft); }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save Action.");
      setSaving(false);
    }
  }

  return (
    <form className="qilife-panel action-form" onSubmit={(event) => void submit(event)}>
      {error && <div className="qilife-error" role="alert">{error}</div>}
      <div className="qilife-form-grid">
        <label className="qilife-label wide">Action title
          <input value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className="qilife-label">Status
          <select value={draft.status} onChange={(e) => set("status", e.target.value)}>
            {["inbox", "next", "waiting", "blocked", "done", "cancelled"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="qilife-label">Priority
          <select value={draft.priority} onChange={(e) => set("priority", e.target.value)}>
            {["low", "medium", "high", "urgent"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="qilife-label">Due date
          <input type="date" value={draft.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value || null)} />
        </label>
        <label className="qilife-label">Project
          <RelationSelector relationEntity="project" value={draft.projectId ?? ""} onChange={(value) => set("projectId", value || null)} />
        </label>
        <label className="qilife-label">Person
          <RelationSelector relationEntity="person" value={draft.peopleIds[0] ?? ""} onChange={(value) => set("peopleIds", value ? [value] : [])} />
        </label>
        <label className="qilife-label">Thread
          <RelationSelector relationEntity="thread" value={draft.threadId ?? ""} onChange={(value) => set("threadId", value || null)} />
        </label>
        <label className="qilife-label">Context
          <input value={draft.context} onChange={(e) => set("context", e.target.value)} />
        </label>
        <label className="qilife-label wide">Notes
          <textarea rows={6} value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
        </label>
      </div>
      <div className="qilife-actions">
        <button className="qilife-btn" type="button" onClick={onCancel}>Cancel</button>
        <button className="qilife-btn primary" disabled={saving}>{saving ? "Saving…" : "Save Action"}</button>
      </div>
    </form>
  );
}
