import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createThreadOnBackend } from "../api/client";
import type { Thread } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getBuckets, getThreads, saveThread } from "../utils/storage";
import { PriorityBadge, StateEmpty } from "./shared";

type Props = {
  refreshToken: number;
};

export function ThreadsPage({ refreshToken }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const buckets = getBuckets();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", bucket_code: "inbox", priority: "normal" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setThreads(getThreads());
  }, [refreshToken]);

  const visible = useMemo(
    () =>
      threads.filter((thread) => {
        const statusMatch = statusFilter === "all" || thread.status === statusFilter;
        if (!statusMatch) return false;
        if (!search.trim()) return true;
        const query = search.trim().toLowerCase();
        return (
          thread.title.toLowerCase().includes(query) ||
          thread.description.toLowerCase().includes(query) ||
          thread.bucket_code.toLowerCase().includes(query)
        );
      }),
    [search, statusFilter, threads],
  );

  async function createThread() {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      let nextThread: Thread;
      try {
        nextThread = await createThreadOnBackend({
          title: form.title.trim(),
          description: form.description.trim(),
          bucket_code: form.bucket_code,
          priority: form.priority,
        });
      } catch {
        nextThread = {
          id: crypto.randomUUID(),
          title: form.title.trim(),
          description: form.description.trim(),
          bucket_code: form.bucket_code,
          priority: form.priority,
          status: "open",
          started_at: new Date().toISOString(),
          closed_at: null,
          tags_json: [],
          next_action: null,
          due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      saveThread(nextThread);
      setThreads(getThreads());
      setShowCreate(false);
      setForm({ title: "", description: "", bucket_code: "inbox", priority: "normal" });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  const counts = {
    all: threads.length,
    open: threads.filter((thread) => thread.status === "open").length,
    active: threads.filter((thread) => thread.status === "active").length,
    closed: threads.filter((thread) => thread.status === "closed").length,
  };

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="stack-sm">
          <div className="section-tag">Threads</div>
          <h2>Cases, projects, and ongoing situations.</h2>
          <p>Threads hold the running context around a situation so QiBits and actions do not live in isolation.</p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={() => setShowCreate(true)}>
          + New Thread
        </button>
      </section>

      <div className="card dense-card stack-md">
        <div className="card-header">
          <div className="filter-chip-row" style={{ flex: 1 }}>
            {(["all", "open", "active", "closed"] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-chip ${statusFilter === status ? "is-active" : ""}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
                <span className="card-count">{counts[status]}</span>
              </button>
            ))}
          </div>
          <div className="search-wrap" style={{ maxWidth: 260 }}>
            <input
              className="search-input"
              placeholder="Search threads"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <StateEmpty icon="◎" text="No threads yet. Create one to track a real situation." />
        ) : (
          <div className="three-col">
            {visible.map((thread) => (
              <Link key={thread.id} to={`/threads/${thread.id}`} className="thread-card record-link-card">
                <div className="compact-row spread">
                  <strong>{thread.title}</strong>
                  <span className={`badge badge-${thread.status.replace(/_/g, "_")}`}>{thread.status.replace(/_/g, " ")}</span>
                </div>
                <div className="compact-text">
                  {thread.description || "No thread description saved yet."}
                </div>
                <div className="item-meta">
                  <PriorityBadge priority={thread.priority} />
                  <span className="badge badge-bucket">{thread.bucket_code}</span>
                  {thread.due_date ? <span className="badge badge-triaged">Due {formatDate(thread.due_date)}</span> : null}
                </div>
                <div className="item-meta">
                  <span className="item-sub">Started {formatRelative(thread.started_at)}</span>
                  {thread.updated_at ? <span className="item-sub">Updated {formatDate(thread.updated_at)}</span> : null}
                </div>
                {thread.next_action ? <div className="compact-text">Next: {thread.next_action}</div> : null}
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-title">New Thread</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Title *</label>
                <input
                  className="text-input"
                  placeholder="Surplus Check Recovery"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea-input"
                  placeholder="What situation does this thread track?"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Space</label>
                <select
                  className="select-input"
                  value={form.bucket_code}
                  onChange={(event) => setForm({ ...form, bucket_code: event.target.value })}
                >
                  {buckets.filter((bucket) => !bucket.is_system).map((bucket) => (
                    <option key={bucket.code} value={bucket.code}>
                      {bucket.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Priority</label>
                <select
                  className="select-input"
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                >
                  {["normal", "high", "urgent", "critical"].map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {saveError ? <div className="error-banner" style={{ marginTop: 12 }}>{saveError}</div> : null}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={saving || !form.title.trim()} onClick={createThread}>
                {saving ? "Creating..." : "Create Thread"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
