import { useState } from "react";
import { apiFetch } from "../api/client";
import { useApi } from "../hooks/use-api";
import type { Bucket, Qibit, Thread } from "../types";
import { StatusBadge, StateEmpty, StateLoading, StateError } from "./shared";
import { formatRelative } from "../utils/format";

type Props = { refreshToken: number };

type TriageState = {
  qibitId: string;
  bucket_code: string;
  thread_id: string;
  action_required: boolean;
  create_action_title: string;
};

export function InboxPage({ refreshToken }: Props) {
  const qibits  = useApi<Qibit[]>("/api/qibits", [], refreshToken);
  const buckets  = useApi<Bucket[]>("/api/buckets", [], 0);
  const threads  = useApi<Thread[]>("/api/threads", [], refreshToken);

  const [triageTarget, setTriageTarget] = useState<Qibit | null>(null);
  const [triage, setTriage] = useState<TriageState>({
    qibitId: "",
    bucket_code: "10",
    thread_id: "",
    action_required: false,
    create_action_title: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const inbox = qibits.data.filter((q) => q.status === "new");

  function openTriage(q: Qibit) {
    setTriageTarget(q);
    setTriage({
      qibitId: q.id,
      bucket_code: q.bucket_code === "00" ? "10" : q.bucket_code,
      thread_id: q.thread_id ?? "",
      action_required: false,
      create_action_title: "",
    });
    setSaveError("");
  }

  async function submitTriage() {
    if (!triageTarget) return;
    setSaving(true);
    setSaveError("");
    try {
      await apiFetch(`/api/qibits/${triageTarget.id}/triage`, {
        method: "POST",
        body: JSON.stringify({
          bucket_code: triage.bucket_code,
          thread_id: triage.thread_id || null,
          action_required: triage.action_required,
          create_action_title: triage.create_action_title || null,
        }),
      });
      setTriageTarget(null);
      qibits.reload?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Triage failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="section-tag">Inbox</div>
        <h2>Chaos catcher for unprocessed QiBits.</h2>
        <p>Every item captured lands here first. Triage each one to a bucket and optional thread.</p>
      </section>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Unprocessed</span>
          <span className="card-count">{inbox.length}</span>
        </div>

        {qibits.loading && <StateLoading />}
        {qibits.error && <StateError message={qibits.error} />}
        {!qibits.loading && inbox.length === 0 && (
          <StateEmpty icon="✓" text="Inbox is clear. All QiBits triaged." />
        )}

        {inbox.map((q) => (
          <div key={q.id} className="item-row">
            <div className="item-main">
              <div className="item-title">{q.title}</div>
              <div className="item-sub" style={{ margin: "4px 0 6px" }}>
                {q.raw_capture.length > 120 ? q.raw_capture.slice(0, 120) + "…" : q.raw_capture}
              </div>
              <div className="item-meta">
                <StatusBadge status={q.status} />
                <span className="badge badge-bucket">B{q.bucket_code}</span>
                <span className="item-sub">{formatRelative(q.captured_at)}</span>
                {q.tags_json?.map((t) => (
                  <span key={t} className="badge badge-type">{t}</span>
                ))}
              </div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              style={{ flexShrink: 0 }}
              onClick={() => openTriage(q)}
            >
              Triage →
            </button>
          </div>
        ))}
      </div>

      {/* Triage Modal */}
      {triageTarget && (
        <div className="modal-backdrop" onClick={() => setTriageTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Triage QiBit</div>

            <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--paper-200)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--ink-600, var(--ink-700))" }}>
              <em>"{triageTarget.raw_capture}"</em>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Bucket</label>
                <select
                  className="select-input"
                  value={triage.bucket_code}
                  onChange={(e) => setTriage({ ...triage, bucket_code: e.target.value })}
                >
                  {buckets.data
                    .filter((b) => !b.is_system && b.code !== "00")
                    .map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} · {b.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Thread (optional)</label>
                <select
                  className="select-input"
                  value={triage.thread_id}
                  onChange={(e) => setTriage({ ...triage, thread_id: e.target.value })}
                >
                  <option value="">— No thread —</option>
                  {threads.data.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={triage.action_required}
                    onChange={(e) => setTriage({ ...triage, action_required: e.target.checked })}
                  />
                  <span className="form-label" style={{ margin: 0 }}>Action required?</span>
                </label>
              </div>

              {triage.action_required && (
                <div className="form-field">
                  <label className="form-label">Create Action (title)</label>
                  <input
                    className="text-input"
                    placeholder="e.g. Follow up with Zai about the $40"
                    value={triage.create_action_title}
                    onChange={(e) => setTriage({ ...triage, create_action_title: e.target.value })}
                  />
                </div>
              )}
            </div>

            {saveError && <div className="error-banner" style={{ marginTop: 12 }}>{saveError}</div>}

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setTriageTarget(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={submitTriage}>
                {saving ? "Saving…" : "Confirm Triage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
