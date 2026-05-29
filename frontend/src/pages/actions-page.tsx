import { useState } from "react";
import { apiFetch } from "../api/client";
import { useApi } from "../hooks/use-api";
import type { Action, Bucket, Thread } from "../types";
import { StatusBadge, PriorityBadge, StateEmpty, StateLoading, StateError } from "./shared";
import { formatDate, formatRelative } from "../utils/format";

type Props = { refreshToken: number };

export function ActionsPage({ refreshToken }: Props) {
  const actions = useApi<Action[]>("/api/actions", [], refreshToken);
  const buckets = useApi<Bucket[]>("/api/buckets", [], 0);
  const threads = useApi<Thread[]>("/api/threads", [], refreshToken);

  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    bucket_code: "10",
    thread_id: "",
    priority: "normal",
    scheduled_for: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const visible = actions.data.filter(
    (a) => statusFilter === "all" || a.status === statusFilter
  );

  const counts = {
    all: actions.data.length,
    open: actions.data.filter((a) => a.status === "open").length,
    in_progress: actions.data.filter((a) => a.status === "in_progress").length,
    waiting_on: actions.data.filter((a) => a.status === "waiting_on").length,
    completed: actions.data.filter((a) => a.status === "completed").length,
  };

  async function createAction() {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await apiFetch<Action>("/api/actions", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          thread_id: form.thread_id || null,
          scheduled_for: form.scheduled_for || null,
        }),
      });
      setShowCreate(false);
      setForm({ title: "", description: "", bucket_code: "10", thread_id: "", priority: "normal", scheduled_for: "" });
      actions.reload?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  async function markComplete(action: Action) {
    try {
      await apiFetch(`/api/actions/${action.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      actions.reload?.();
    } catch {
      // silent
    }
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="section-tag">Actions</div>
        <h2>Work orders derived from real life.</h2>
        <p>Actions are the executable layer. They are linked back to source QiBits for full provenance.</p>
      </section>

      <div className="card">
        <div className="card-header">
          <div className="filter-bar" style={{ flex: 1 }}>
            {(Object.entries(counts) as [string, number][]).map(([s, n]) => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setStatusFilter(s)}
              >
                {s.replace("_", " ")} <span style={{ opacity: 0.65, marginLeft: 3 }}>{n}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-accent btn-sm" onClick={() => setShowCreate(true)}>
            + New Action
          </button>
        </div>

        {actions.loading && <StateLoading />}
        {actions.error && <StateError message={actions.error} />}
        {!actions.loading && visible.length === 0 && (
          <StateEmpty icon="◷" text="No actions in this view." />
        )}

        {visible.map((a) => (
          <div key={a.id} className="item-row">
            <div className="item-main">
              <div className="item-title">{a.title}</div>
              {a.description && (
                <div className="item-sub" style={{ margin: "3px 0 6px" }}>{a.description}</div>
              )}
              <div className="item-meta">
                <StatusBadge status={a.status} />
                <PriorityBadge priority={a.priority} />
                <span className="badge badge-bucket">B{a.bucket_code}</span>
                {a.scheduled_for && (
                  <span className="badge" style={{ background: "rgba(74,127,176,0.1)", color: "var(--status-new)" }}>
                    {formatDate(a.scheduled_for)}
                  </span>
                )}
                {a.completed_at && (
                  <span className="item-sub">Done {formatRelative(a.completed_at)}</span>
                )}
              </div>
            </div>
            {a.status !== "completed" && (
              <button
                className="btn btn-ghost btn-xs"
                style={{ flexShrink: 0 }}
                onClick={() => markComplete(a)}
                title="Mark complete"
              >
                ✓
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">New Action</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Title *</label>
                <input
                  className="text-input"
                  placeholder="e.g. Collect $40 from Zai"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea-input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Bucket</label>
                  <select className="select-input" value={form.bucket_code} onChange={(e) => setForm({ ...form, bucket_code: e.target.value })}>
                    {buckets.data.filter((b) => !b.is_system && b.code !== "00").map((b) => (
                      <option key={b.code} value={b.code}>{b.code} · {b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Priority</label>
                  <select className="select-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {["normal", "high", "urgent", "critical"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Thread (optional)</label>
                <select className="select-input" value={form.thread_id} onChange={(e) => setForm({ ...form, thread_id: e.target.value })}>
                  <option value="">— No thread —</option>
                  {threads.data.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Scheduled For</label>
                <input
                  type="datetime-local"
                  className="text-input"
                  value={form.scheduled_for}
                  onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
                />
              </div>
            </div>
            {saveError && <div className="error-banner" style={{ marginTop: 12 }}>{saveError}</div>}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={saving || !form.title.trim()}
                onClick={createAction}
              >
                {saving ? "Creating…" : "Create Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
