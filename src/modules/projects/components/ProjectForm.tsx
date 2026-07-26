import { useState } from "react";
import { RelationSelector } from "../../../features/qilife/components/RelationSelector";
import type { ProjectDraft } from "../types";

export const emptyProject: ProjectDraft = { name: "", status: "active", priority: "medium", dueDate: null, ownerId: null, area: "", tags: [], brief: "" };

export function ProjectForm({ initial = emptyProject, onSave, onCancel }: { initial?: ProjectDraft; onSave: (draft: ProjectDraft) => Promise<void>; onCancel: () => void }) {
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
      <label className="qilife-label wide">Name<input value={draft.name} onChange={(e) => set("name", e.target.value)} /></label>
      <label className="qilife-label">Status<select value={draft.status} onChange={(e) => set("status", e.target.value)}>{["active", "on_hold", "backlog", "done", "cancelled"].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="qilife-label">Priority<select value={draft.priority} onChange={(e) => set("priority", e.target.value)}>{["low", "medium", "high"].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="qilife-label">Due date<input type="date" value={draft.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value || null)} /></label>
      <label className="qilife-label">Owner<RelationSelector relationEntity="person" value={draft.ownerId ?? ""} onChange={(v) => set("ownerId", v || null)} /></label>
      <label className="qilife-label">Area<input value={draft.area} onChange={(e) => set("area", e.target.value)} /></label>
      <label className="qilife-label wide">Tags<input value={draft.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))} /></label>
      <label className="qilife-label wide">Desired outcome<textarea rows={6} value={draft.brief} onChange={(e) => set("brief", e.target.value)} /></label>
    </div>
    <div className="qilife-actions"><button className="qilife-btn" type="button" onClick={onCancel}>Cancel</button><button className="qilife-btn primary" disabled={saving}>{saving ? "Saving…" : "Save Project"}</button></div>
  </form>;
}
