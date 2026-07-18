import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useApi } from "../hooks/use-api";
import { buildDraft, mockAgentDraft } from "../utils/mock-agent";
import { getQiBits, saveActions, savePendingDraft, saveQiBit } from "../utils/storage";
import type { Bucket, QiBit, Thread } from "../types";
import { StateEmpty, StateError, StateLoading } from "./shared";
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
  const navigate = useNavigate();
  const qibits = useApi<QiBit[]>("/api/qibits", [], refreshToken);
  const buckets = useApi<Bucket[]>("/api/buckets", [], 0);
  const threads = useApi<Thread[]>("/api/threads", [], refreshToken);

  const [triageTarget, setTriageTarget] = useState<QiBit | null>(null);
  const [triage, setTriage] = useState<TriageState>({
    qibitId: "",
    bucket_code: "10",
    thread_id: "",
    action_required: false,
    create_action_title: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const localInbox = getQiBits().filter((qibit) => qibit.status === "new");
  const inboxMap = new Map<string, QiBit>();
  [...qibits.data, ...localInbox].forEach((qibit) => {
    if (qibit.status === "new") {
      inboxMap.set(qibit.id, qibit);
    }
  });
  const inbox = Array.from(inboxMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function openTriage(qibit: QiBit) {
    setTriageTarget(qibit);
    setTriage({
      qibitId: qibit.id,
      bucket_code: qibit.bucket_code === "00" || !qibit.bucket_code ? "10" : qibit.bucket_code,
      thread_id: qibit.thread_id ?? "",
      action_required: qibit.action_required ?? false,
      create_action_title: qibit.suggested_action ?? "",
    });
    setSaveError("");
  }

  function draftReview(qibit: QiBit) {
    const agentDraft = qibit.agentDraft?.detectedSignals?.length ? qibit.agentDraft : mockAgentDraft(qibit.rawText);
    const draft = buildDraft(qibit.rawText, qibit.source || "backend", qibit.id, agentDraft, qibit.createdAt);
    savePendingDraft(draft);
    navigate("/review");
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
      qibits.reload();
    } catch (error) {
      const bucketName = buckets.data.find((bucket) => bucket.code === triage.bucket_code)?.name ?? triage.bucket_code;
      const updatedQiBit: QiBit = {
        ...triageTarget,
        status: "triaged",
        space: bucketName,
        bucket_code: triage.bucket_code,
        thread_id: triage.thread_id || null,
        action_required: triage.action_required,
        suggested_action: triage.create_action_title || null,
        updatedAt: new Date().toISOString(),
      };
      saveQiBit(updatedQiBit);

      if (triage.action_required && triage.create_action_title.trim()) {
        saveActions([
          {
            id: crypto.randomUUID(),
            qibitId: triageTarget.id,
            createdAt: new Date().toISOString(),
            title: triage.create_action_title.trim(),
            status: "open",
            priority: triageTarget.priority,
            sourceText: triageTarget.rawText,
            qibitTitle: triageTarget.title,
            thread_id: triage.thread_id || null,
            bucket_code: triage.bucket_code,
          },
        ]);
      }

      setTriageTarget(null);
      qibits.reload();
      console.warn("Inbox triage falling back to local storage.", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Inbox</div>
          <h2>New QiBits waiting for interpretation.</h2>
          <p>Raw captures land here first when backend intake is connected. Draft for review or triage them into a bucket and thread.</p>
          <p className="compact-text">Offline captures also stay visible here through local fallback mode.</p>
        </div>
      </section>

      <section className="card dense-card stack-md">
        <div className="card-header">
          <span className="card-title">Unprocessed QiBits</span>
          <span className="card-count">{inbox.length}</span>
        </div>

        {qibits.loading ? <StateLoading /> : null}
        {qibits.error ? <StateError message={qibits.error} /> : null}
        {!qibits.loading && inbox.length === 0 ? (
          <StateEmpty text="Inbox is clear. New backend captures will appear here." icon="✓" />
        ) : null}

        <div className="stack-sm">
          {inbox.map((qibit) => (
            <article key={qibit.id} className="record-link-card">
              <div className="compact-row spread">
                <div className="stack-xs">
                  <strong>{qibit.title || "Untitled capture"}</strong>
                  <span className="compact-text">{qibit.rawText}</span>
                </div>
                <span className="badge badge-bucket">{qibit.space || "Inbox"}</span>
              </div>

              <div className="item-meta">
                <span className="badge badge-type">{qibit.type}</span>
                <span className={`badge badge-${qibit.priority}`}>{qibit.priority}</span>
                <span className="item-sub">{formatRelative(qibit.createdAt)}</span>
              </div>

              <div className="item-meta">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => draftReview(qibit)}>
                  Draft Review
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => openTriage(qibit)}>
                  Quick Triage
                </button>
                <Link to={`/qibits/${qibit.id}`} className="inline-link">
                  Open record
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {triageTarget ? (
        <div className="modal-backdrop" onClick={() => setTriageTarget(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-title">Quick Triage</div>

            <div className="raw-panel">{triageTarget.rawText}</div>

            <div className="stack-md" style={{ marginTop: 12 }}>
              <div>
                <label className="form-label">Bucket</label>
                <select className="select-input" value={triage.bucket_code} onChange={(event) => setTriage({ ...triage, bucket_code: event.target.value })}>
                  {buckets.data
                    .filter((bucket) => !bucket.is_system && bucket.code !== "00")
                    .map((bucket) => (
                      <option key={bucket.code} value={bucket.code}>
                        {bucket.code} · {bucket.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="form-label">Thread</label>
                <select className="select-input" value={triage.thread_id} onChange={(event) => setTriage({ ...triage, thread_id: event.target.value })}>
                  <option value="">No thread</option>
                  {threads.data.map((thread) => (
                    <option key={thread.id} value={thread.id}>
                      {thread.title}
                    </option>
                  ))}
                </select>
              </div>

              <label className="compact-row">
                <input
                  type="checkbox"
                  checked={triage.action_required}
                  onChange={(event) => setTriage({ ...triage, action_required: event.target.checked })}
                />
                <span className="compact-text">Create action while triaging</span>
              </label>

              {triage.action_required ? (
                <div>
                  <label className="form-label">Action Title</label>
                  <input
                    className="text-input"
                    value={triage.create_action_title}
                    onChange={(event) => setTriage({ ...triage, create_action_title: event.target.value })}
                    placeholder="Action title"
                  />
                </div>
              ) : null}
            </div>

            {saveError ? <div className="error-banner" style={{ marginTop: 12 }}>{saveError}</div> : null}

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setTriageTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={submitTriage}>
                {saving ? "Saving..." : "Confirm Triage"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
