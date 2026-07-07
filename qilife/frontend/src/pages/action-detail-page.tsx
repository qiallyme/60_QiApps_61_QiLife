import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, History, Link2 } from "lucide-react";
import { BackendUnavailableError, getActionFromBackend, getQiBitFromBackend, updateActionStatusOnBackend } from "../api/client";
import type { Action, QiBit, TimelineRow } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getActionById, getQiBitById, getThreadById, getTimelineItemById, saveActions, saveQiBit, updateActionStatus } from "../utils/storage";
import { StateEmpty } from "./shared";

type Props = {
  refreshToken: number;
};

export function ActionDetailPage({ refreshToken }: Props) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [action, setAction] = useState<Action | null>(null);
  const [qibit, setQiBit] = useState<QiBit | null>(null);
  const [timelineItem, setTimelineItem] = useState<TimelineRow | null>(null);
  const [threadTitle, setThreadTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nextAction = id ? getActionById(id) : null;
    setAction(nextAction);

    if (!nextAction?.qibitId) {
      setQiBit(null);
      setTimelineItem(null);
    } else {
      setQiBit(getQiBitById(nextAction.qibitId));
      setTimelineItem(getTimelineItemById(nextAction.qibitId));
    }
    setThreadTitle(nextAction?.thread_id ? getThreadById(nextAction.thread_id)?.title ?? nextAction.thread_id : null);
  }, [id, refreshToken]);

  useEffect(() => {
    if (!id || action) return;

    let active = true;
    setLoading(true);

    getActionFromBackend(id)
      .then(async (payload) => {
        if (!active) return;
        saveActions([payload]);
        setAction(payload);

        if (payload.qibitId) {
          try {
            const qibitPayload = await getQiBitFromBackend(payload.qibitId);
            if (!active) return;
            saveQiBit(qibitPayload);
            setQiBit(getQiBitById(payload.qibitId));
            setTimelineItem(getTimelineItemById(payload.qibitId));
          } catch (error) {
            if (!(error instanceof BackendUnavailableError)) {
              console.warn("Linked QiBit fetch unavailable.", error);
            }
          }
        }
      })
      .catch((error) => {
        if (!(error instanceof BackendUnavailableError)) {
          console.warn("Action detail fetch unavailable.", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [action, id]);

  async function toggleStatus() {
    if (!action) return;

    const nextStatus = action.status === "open" ? "done" : "open";
    try {
      await updateActionStatusOnBackend(action.id, nextStatus, action.dueHint, action.sourceText);
    } catch (error) {
      console.warn("Action status update falling back to local storage.", error);
    }
    updateActionStatus(action.id, nextStatus);
    setAction({ ...action, status: nextStatus });
  }

  if (!action) {
    return (
      <div className="page-stack">
        <section className="desk-banner">
          <div>
            <div className="section-tag subdued">Action</div>
            <h2>{loading ? "Loading action" : "Action not found"}</h2>
            <p>{loading ? "Checking backend and local storage for this action." : "The requested action is not available in the current local data set."}</p>
          </div>
        </section>
        <section className="card dense-card">
          <StateEmpty icon={<CheckCircle2 size={24} />} text={loading ? "Looking up action details." : "Open the Actions page to continue from a saved action."} />
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="desk-banner detail-banner">
        <div className="stack-sm">
          <div className="compact-row wrap-gap">
            <span className="section-tag subdued">Action</span>
            <span className={`badge ${action.status === "done" ? "badge-bucket" : "badge-open"}`}>{action.status}</span>
            <span className={`badge badge-${action.priority}`}>{action.priority}</span>
            {action.dueHint ? <span className="badge badge-triaged">{action.dueHint}</span> : null}
          </div>
          <h2>{action.title}</h2>
          <p>{action.sourceText ?? "No source text captured."}</p>
          <div className="item-meta">
            <span className="item-sub">Created {formatDate(action.createdAt)}</span>
            <span className="item-sub">{formatRelative(action.createdAt)}</span>
          </div>
        </div>

        <div className="action-row detail-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
          <button type="button" className={`btn ${action.status === "done" ? "btn-outline" : "btn-primary"}`} onClick={toggleStatus}>
            <CheckCircle2 size={16} />
            Mark {action.status === "done" ? "Open" : "Done"}
          </button>
          <Link to="/actions" className="btn btn-outline">
            Open Actions
          </Link>
          {qibit ? (
            <Link to={`/qibits/${qibit.id}`} className="btn btn-outline">
              <Link2 size={16} />
              Linked QiBit
            </Link>
          ) : null}
        </div>
      </section>

      <div className="two-col detail-grid">
        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Action Record</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Status</span>
            <span className={`badge ${action.status === "done" ? "badge-bucket" : "badge-open"}`}>{action.status}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Priority</span>
            <span className={`badge badge-${action.priority}`}>{action.priority}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Due Hint</span>
            <span>{action.dueHint ?? "No due hint saved."}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Thread</span>
            {action.thread_id ? (
              <Link to={`/threads/${action.thread_id}`} className="chip-link">
                {threadTitle ?? action.thread_id}
              </Link>
            ) : (
              <span>No thread linked.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Source Text</span>
            <div className="raw-panel">{action.sourceText ?? "No source text captured."}</div>
          </div>
        </section>

        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Linked Context</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Linked QiBit</span>
            {qibit ? (
              <Link to={`/qibits/${qibit.id}`} className="record-link-card">
                <div className="compact-row spread">
                  <strong>{qibit.title}</strong>
                  <span className="badge badge-type">{qibit.type}</span>
                </div>
                <div className="compact-text">{qibit.summary}</div>
                <div className="item-meta">
                  <span className="badge badge-bucket">{qibit.space}</span>
                  <span className="item-sub">{formatRelative(qibit.createdAt)}</span>
                </div>
              </Link>
            ) : (
              <span className="compact-text">No QiBit is linked to this action.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Timeline</span>
            {timelineItem ? (
              <Link to={`/timeline?q=${encodeURIComponent(timelineItem.title)}`} className="record-link-card">
                <div className="compact-row spread">
                  <strong>{timelineItem.title}</strong>
                  <span className="item-sub">{formatRelative(timelineItem.timestamp)}</span>
                </div>
                <div className="compact-text">{timelineItem.payload.summary ?? "No timeline summary saved."}</div>
              </Link>
            ) : (
              <span className="compact-text">No related timeline item found.</span>
            )}
          </div>

          {qibit ? (
            <div className="detail-block">
              <span className="form-label">Related Metadata</span>
              <div className="item-meta">
                <Link to={`/timeline?space=${encodeURIComponent(qibit.space)}`} className="chip-link">
                  {qibit.space}
                </Link>
                <Link to={`/timeline?type=${encodeURIComponent(qibit.type)}`} className="chip-link">
                  {qibit.type}
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
