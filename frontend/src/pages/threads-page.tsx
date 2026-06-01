import { useState, useEffect } from "react";
import type { Bucket, Thread } from "../types";
import { StatusBadge, PriorityBadge, StateEmpty } from "./shared";
import { formatDate } from "../utils/format";
import { getThreads, saveThread, getBuckets } from "../utils/storage";

export function ThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const buckets = getBuckets();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", bucket_code: "inbox", priority: "normal" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  
  useEffect(() => {
    setThreads(getThreads());
  }, []);

  const visible = threads.filter(
    (t) => statusFilter === "all" || t.status === statusFilter
  );

  async function createThread() {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const newThread: Thread = {
        id: crypto.randomUUID(),
        title: form.title,
        description: form.description,
        bucket_code: form.bucket_code,
        priority: form.priority,
        status: "open",
        started_at: new Date().toISOString(),
        closed_at: null,
        tags_json: [],
        next_action: null,
        due_date: null
      };
      
      saveThread(newThread);
      
      setShowCreate(false);
      setForm({ title: "", description: "", bucket_code: "inbox", priority: "normal" });
      setThreads(getThreads());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  const counts = {
    all: threads.length,
    open: threads.filter((t) => t.status === "open").length,
    active: threads.filter((t) => t.status === "active").length,
    closed: threads.filter((t) => t.status === "closed").length,
  };

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="section-tag">Threads</div>
        <h2>Cases, projects, and storylines.</h2>
        <p>A thread groups the full situation — QiBits, actions, people, money, and context.</p>
      </section>

      <div className="card">
        <div className="card-header">
          <div className="filter-bar" style={{ flex: 1 }}>
            {(["all", "open", "active", "closed"] as const).map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setStatusFilter(s)}
              >
                {s} <span style={{ opacity: 0.65, marginLeft: 3 }}>{counts[s]}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-accent btn-sm" onClick={() => setShowCreate(true)}>
            + New Thread
          </button>
        </div>

        {visible.length === 0 && (
          <StateEmpty icon="◎" text="No threads yet. Create one to track a situation." />
        )}

        <div className="three-col" style={{ marginTop: 4 }}>
          {visible.map((t) => (
            <div key={t.id} className="thread-card">
              <div className="thread-card-header">
                <div className="thread-card-title">{t.title}</div>
                <StatusBadge status={t.status} />
              </div>
              {t.description && (
                <div className="thread-card-desc">
                  {t.description.length > 100
                    ? t.description.slice(0, 100) + "…"
                    : t.description}
                </div>
              )}
              <div className="thread-card-footer">
                <PriorityBadge priority={t.priority} />
                <span className="badge badge-bucket">Spc: {t.bucket_code}</span>
                {t.due_date && (
                  <span className="badge" style={{ background: "rgba(192,68,58,0.1)", color: "var(--accent-red)" }}>
                    Due {formatDate(t.due_date)}
                  </span>
                )}
              </div>
              {t.next_action && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-400)" }}>
                  Next: {t.next_action}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Thread Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">New Thread</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Title *</label>
                <input
                  className="text-input"
                  placeholder="e.g. Surplus Check Recovery"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea-input"
                  placeholder="What's this thread about?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Space</label>
                <select
                  className="select-input"
                  value={form.bucket_code}
                  onChange={(e) => setForm({ ...form, bucket_code: e.target.value })}
                >
                  {buckets.filter((b) => !b.is_system && b.code !== "00").map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Priority</label>
                <select
                  className="select-input"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {["normal", "high", "urgent", "critical"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            {saveError && <div className="error-banner" style={{ marginTop: 12 }}>{saveError}</div>}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={saving || !form.title.trim()}
                onClick={createThread}
              >
                {saving ? "Creating…" : "Create Thread"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
