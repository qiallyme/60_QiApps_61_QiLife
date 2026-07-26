import { useId, useState } from "react";
import { RelationSelector } from "../../../features/qilife/components/RelationSelector";
import type { ProjectDraft } from "../types";

export const emptyProject: ProjectDraft = { name: "", status: "active", priority: "medium", dueDate: null, ownerId: null, area: "", tags: [], brief: "" };

export function ProjectForm({ initial = emptyProject, onSave, onCancel }: { initial?: ProjectDraft; onSave: (draft: ProjectDraft) => Promise<void>; onCancel: () => void }) {
  const fieldId = useId();
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return setError("Project name is required.");
    setSaving(true); setError("");
    try { await onSave(draft); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save Project."); setSaving(false); }
  }
  return <form className="qilife-panel" onSubmit={(event) => void submit(event)}>
    {error && <div className="qilife-error">{error}</div>}
    <div className="qilife-form-grid">
      <label className="qilife-label wide" htmlFor={`${fieldId}-name`}>Name<input id={`${fieldId}-name`} name="name" value={draft.name} onChange={(e) => set("name", e.target.value)} /></label>
      <label className="qilife-label" htmlFor={`${fieldId}-status`}>Status<select id={`${fieldId}-status`} name="status" value={draft.status} onChange={(e) => set("status", e.target.value)}>{["active", "on_hold", "backlog", "done", "cancelled"].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="qilife-label" htmlFor={`${fieldId}-priority`}>Priority<select id={`${fieldId}-priority`} name="priority" value={draft.priority} onChange={(e) => set("priority", e.target.value)}>{["low", "medium", "high"].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="qilife-label" htmlFor={`${fieldId}-due-date`}>Due date<input id={`${fieldId}-due-date`} name="dueDate" type="date" value={draft.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value || null)} /></label>
      <label className="qilife-label" htmlFor={`${fieldId}-owner`}>Owner<RelationSelector id={`${fieldId}-owner`} name="ownerId" relationEntity="person" value={draft.ownerId ?? ""} onChange={(v) => set("ownerId", v || null)} /></label>
      <label className="qilife-label" htmlFor={`${fieldId}-area`}>Area<input id={`${fieldId}-area`} name="area" value={draft.area} onChange={(e) => set("area", e.target.value)} /></label>
      <label className="qilife-label wide" htmlFor={`${fieldId}-tags`}>Tags<input id={`${fieldId}-tags`} name="tags" value={draft.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))} /></label>
      <label className="qilife-label wide" htmlFor={`${fieldId}-brief`}>Desired outcome<textarea id={`${fieldId}-brief`} name="brief" rows={6} value={draft.brief} onChange={(e) => set("brief", e.target.value)} /></label>
    </div>
    <div className="qilife-actions"><button className="qilife-btn" type="button" onClick={onCancel}>Cancel</button><button className="qilife-btn primary" disabled={saving}>{saving ? "Saving…" : "Save Project"}</button></div>
  </form>;
}
