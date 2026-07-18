import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Brain, CheckCircle2, Copy, History, PlusCircle } from "lucide-react";
import { BackendUnavailableError, apiFetch } from "../api/client";
import type { Action, QiBit, TimelineRow } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getActionsForQiBit, getQiBitById, getQiBits, getTimelineItemById, saveActions, saveQiBit, saveTimelineItem } from "../utils/storage";
import { StateEmpty } from "./shared";

type Props = {
  refreshToken: number;
};

export function QiBitDetailPage({ refreshToken }: Props) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [qibit, setQiBit] = useState<QiBit | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [timelineItem, setTimelineItem] = useState<TimelineRow | null>(null);
  const [relatedQiBits, setRelatedQiBits] = useState<QiBit[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nextQiBit = id ? getQiBitById(id) : null;
    setQiBit(nextQiBit);
    setActions(id ? getActionsForQiBit(id) : []);
    setTimelineItem(id ? getTimelineItemById(id) : null);

    if (!nextQiBit) {
      setRelatedQiBits([]);
      return;
    }

    const related = getQiBits().filter((item) => {
      if (item.id === nextQiBit.id) return false;
      if (item.space === nextQiBit.space) return true;
      if (item.type === nextQiBit.type) return true;
      return item.tags.some((tag) => nextQiBit.tags.includes(tag));
    });

    setRelatedQiBits(related.slice(0, 6));
  }, [id, refreshToken]);

  useEffect(() => {
    if (!id || qibit) return;

    let active = true;
    setLoading(true);

    apiFetch<(QiBit & { linkedActions?: Action[]; timeline?: TimelineRow })>(`/api/qibits/${id}`)
      .then((payload) => {
        if (!active) return;
        saveQiBit(payload);
        if (payload.linkedActions?.length) {
          saveActions(payload.linkedActions);
        }
        if (payload.timeline) {
          saveTimelineItem(payload.timeline);
        }
        setQiBit(getQiBitById(id));
        setActions(getActionsForQiBit(id));
        setTimelineItem(getTimelineItemById(id));
      })
      .catch((error) => {
        if (!(error instanceof BackendUnavailableError)) {
          console.warn("QiBit detail fetch unavailable.", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, qibit]);

  const timelineQuery = useMemo(() => {
    if (!qibit) return "/timeline";
    return `/timeline?q=${encodeURIComponent(qibit.title)}`;
  }, [qibit]);

  async function handleCopySummary() {
    if (!qibit?.summary) return;

    try {
      await navigator.clipboard.writeText(qibit.summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function startRelatedCapture() {
    if (!qibit) return;
    navigate("/capture", {
      state: {
        prefill: `Follow-up on ${qibit.title}: `,
        sourceType: qibit.type,
      },
    });
  }

  if (!qibit) {
    return (
      <div className="page-stack">
        <section className="desk-banner">
          <div>
            <div className="section-tag subdued">QiBit</div>
            <h2>{loading ? "Loading record" : "Record not found"}</h2>
            <p>{loading ? "Checking backend and local storage for this QiBit." : "The requested QiBit is not available in the current local data set."}</p>
          </div>
        </section>
        <section className="card dense-card">
          <StateEmpty icon={<History size={24} />} text={loading ? "Looking up record details." : "Open Timeline or Today to continue from an existing record."} />
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="desk-banner detail-banner">
        <div className="stack-sm">
          <div className="compact-row wrap-gap">
            <span className="section-tag subdued">QiBit</span>
            <span className="badge badge-type">{qibit.type}</span>
            <span className={`badge badge-${qibit.priority}`}>{qibit.priority}</span>
            <span className="badge badge-bucket">{qibit.space}</span>
          </div>
          <h2>{qibit.title}</h2>
          <p>{qibit.summary}</p>
          <div className="item-meta">
            <span className="item-sub">Created {formatDate(qibit.createdAt)}</span>
            <span className="item-sub">{formatRelative(qibit.createdAt)}</span>
            <span className="item-sub">Updated {formatDate(qibit.updatedAt)}</span>
            <span className="item-sub">Source {qibit.source}</span>
          </div>
        </div>

        <div className="action-row detail-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
          <Link to={timelineQuery} className="btn btn-outline">
            <History size={16} />
            Go to Timeline
          </Link>
          <Link to="/actions" className="btn btn-outline">
            <CheckCircle2 size={16} />
            Go to Actions
          </Link>
          <button type="button" className="btn btn-outline" onClick={handleCopySummary}>
            <Copy size={16} />
            {copied ? "Copied" : "Copy summary"}
          </button>
          <button type="button" className="btn btn-primary" onClick={startRelatedCapture}>
            <PlusCircle size={16} />
            Start related capture
          </button>
        </div>
      </section>

      <div className="two-col detail-grid">
        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Record</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Summary</span>
            <p>{qibit.summary}</p>
          </div>

          <div className="detail-block">
            <span className="form-label">Raw Capture</span>
            <div className="raw-panel">{qibit.rawText || "No raw capture text saved."}</div>
          </div>

          <div className="detail-block">
            <span className="form-label">Tags</span>
            <div className="item-meta">
              {qibit.tags.length > 0 ? (
                qibit.tags.map((tag) => (
                  <Link key={tag} to={`/timeline?tag=${encodeURIComponent(tag)}`} className="chip-link">
                    #{tag}
                  </Link>
                ))
              ) : (
                <span className="compact-text">No tags saved.</span>
              )}
            </div>
          </div>

          <div className="detail-block">
            <span className="form-label">Agent Insight</span>
            <div className="insight-row">
              <Brain size={16} />
              <div className="stack-xs">
                <strong>{qibit.agentDraft.suggestedTitle}</strong>
                <span className="compact-text">{qibit.insight}</span>
              </div>
            </div>
          </div>

          <div className="detail-block">
            <span className="form-label">Detected Signals</span>
            <div className="item-meta">
              {qibit.agentDraft.detectedSignals.length > 0 ? (
                qibit.agentDraft.detectedSignals.map((signal) => (
                  <span key={signal} className="badge badge-triaged">
                    {signal}
                  </span>
                ))
              ) : (
                <span className="compact-text">No signals recorded.</span>
              )}
            </div>
          </div>

          <div className="detail-block">
            <span className="form-label">Confidence</span>
            <span className="badge badge-open">{qibit.agentDraft.confidence}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Queue</span>
            <span>{qibit.bucket_code ?? qibit.space}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Thread</span>
            {qibit.thread_id ? (
              <Link to={`/timeline?thread=${encodeURIComponent(qibit.thread_id)}`} className="chip-link">
                {qibit.thread_id}
              </Link>
            ) : (
              <span>No thread linked.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Future Slot</span>
            {qibit.future_slot ? (
              <Link to={`/timeline?slot=${encodeURIComponent(qibit.future_slot)}`} className="chip-link">
                {qibit.future_slot.replace(/_/g, " ")}
              </Link>
            ) : (
              <span>Not slotted yet.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Action Required</span>
            <span>{qibit.action_required ? "Yes" : "No"}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Linked People</span>
            <div className="item-meta">
              {qibit.linkedPeople && qibit.linkedPeople.length > 0 ? (
                qibit.linkedPeople.map((person) => (
                  <Link key={person.id} to={`/people/${person.id}`} className="chip-link">
                    {person.display_name}
                  </Link>
                ))
              ) : (
                <span className="compact-text">No linked people saved.</span>
              )}
            </div>
          </div>
        </section>

        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Linked Records</span>
            <span className="card-count">{actions.length}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Generated Actions</span>
            {actions.length > 0 ? (
              <div className="stack-sm">
                {actions.map((action) => (
                  <Link key={action.id} to={`/actions/${action.id}`} className="record-link-card">
                    <div className="compact-row spread">
                      <strong>{action.title}</strong>
                      <span className={`badge ${action.status === "done" ? "badge-bucket" : "badge-open"}`}>{action.status}</span>
                    </div>
                    <div className="item-meta">
                      <span className={`badge badge-${action.priority}`}>{action.priority}</span>
                      {action.dueHint ? <span className="badge badge-triaged">{action.dueHint}</span> : null}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <span className="compact-text">No generated actions linked to this QiBit.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Timeline Context</span>
            {timelineItem ? (
              <Link to={timelineQuery} className="record-link-card">
                <div className="compact-row spread">
                  <strong>{timelineItem.title}</strong>
                  <span className="item-sub">{formatRelative(timelineItem.timestamp)}</span>
                </div>
                <div className="compact-text">{timelineItem.payload.summary ?? "No timeline summary saved."}</div>
              </Link>
            ) : (
              <span className="compact-text">No timeline item linked yet.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Same Space</span>
            <Link to={`/timeline?space=${encodeURIComponent(qibit.space)}`} className="chip-link">
              {qibit.space}
            </Link>
          </div>

          <div className="detail-block">
            <span className="form-label">Same Type</span>
            <Link to={`/timeline?type=${encodeURIComponent(qibit.type)}`} className="chip-link">
              {qibit.type}
            </Link>
          </div>

          <div className="detail-block">
            <span className="form-label">Related Records</span>
            {relatedQiBits.length > 0 ? (
              <div className="stack-sm">
                {relatedQiBits.map((related) => (
                  <Link key={related.id} to={`/qibits/${related.id}`} className="record-link-card">
                    <div className="compact-row spread">
                      <strong>{related.title}</strong>
                      <span className="badge badge-type">{related.type}</span>
                    </div>
                    <div className="item-meta">
                      <span className="badge badge-bucket">{related.space}</span>
                      <span className="item-sub">{formatRelative(related.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <span className="compact-text">No nearby related records yet.</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
