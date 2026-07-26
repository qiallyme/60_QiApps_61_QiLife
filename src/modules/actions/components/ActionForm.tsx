import { useId, useState } from "react";
import { MultiRelationSelector, RelationSelector } from "../../../features/qilife/components/RelationSelector";
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
  const fieldId = useId();
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
        <label className="qilife-label wide" htmlFor={`${fieldId}-title`}>Action title
          <input id={`${fieldId}-title`} name="title" value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className="qilife-label" htmlFor={`${fieldId}-status`}>Status
          <select id={`${fieldId}-status`} name="status" value={draft.status} onChange={(e) => set("status", e.target.value)}>
            {["inbox", "next", "waiting", "blocked", "done", "cancelled"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="qilife-label" htmlFor={`${fieldId}-priority`}>Priority
          <select id={`${fieldId}-priority`} name="priority" value={draft.priority} onChange={(e) => set("priority", e.target.value)}>
            {["low", "medium", "high", "urgent"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="qilife-label" htmlFor={`${fieldId}-due-date`}>Due date
          <input id={`${fieldId}-due-date`} name="dueDate" type="date" value={draft.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value || null)} />
        </label>
        <label className="qilife-label" htmlFor={`${fieldId}-project`}>Project
          <RelationSelector id={`${fieldId}-project`} name="projectId" relationEntity="project" value={draft.projectId ?? ""} onChange={(value) => set("projectId", value || null)} />
        </label>
        <label className="qilife-label" htmlFor={`${fieldId}-people`}>People
          <MultiRelationSelector id={`${fieldId}-people`} name="peopleIds" relationEntity="person" values={draft.peopleIds} onChange={(values) => set("peopleIds", values)} />
        </label>
        <label className="qilife-label" htmlFor={`${fieldId}-thread`}>Thread
          <RelationSelector id={`${fieldId}-thread`} name="threadId" relationEntity="thread" value={draft.threadId ?? ""} onChange={(value) => set("threadId", value || null)} />
        </label>
        <label className="qilife-label" htmlFor={`${fieldId}-context`}>Context
          <input id={`${fieldId}-context`} name="context" value={draft.context} onChange={(e) => set("context", e.target.value)} />
        </label>
        <label className="qilife-label wide" htmlFor={`${fieldId}-notes`}>Notes
          <textarea id={`${fieldId}-notes`} name="notes" rows={6} value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
        </label>
      </div>
      <div className="qilife-actions">
        <button className="qilife-btn" type="button" onClick={onCancel}>Cancel</button>
        <button className="qilife-btn primary" disabled={saving}>{saving ? "Saving…" : "Save Action"}</button>
      </div>
    </form>
  );
}
