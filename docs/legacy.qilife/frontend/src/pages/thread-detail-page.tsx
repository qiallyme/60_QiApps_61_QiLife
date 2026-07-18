import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, History, Layers3, PlusCircle } from "lucide-react";
import { BackendUnavailableError, getThreadFromBackend } from "../api/client";
import type { Action, QiBit, Thread } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getActions, getQiBits, getThreadById, saveThread } from "../utils/storage";
import { StateEmpty } from "./shared";

type Props = {
  refreshToken: number;
};

export function ThreadDetailPage({ refreshToken }: Props) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);
  const [relatedQiBits, setRelatedQiBits] = useState<QiBit[]>([]);
  const [relatedActions, setRelatedActions] = useState<Action[]>([]);

  useEffect(() => {
    const nextThread = id ? getThreadById(id) : null;
    setThread(nextThread);

    if (!nextThread) {
      setRelatedQiBits([]);
      setRelatedActions([]);
      return;
    }

    const qibits = getQiBits().filter(
      (qibit) => qibit.thread_id === nextThread.id || qibit.bucket_code === nextThread.bucket_code || qibit.space === nextThread.bucket_code,
    );
    const actions = getActions().filter(
      (action) => action.thread_id === nextThread.id || action.bucket_code === nextThread.bucket_code,
    );

    setRelatedQiBits(qibits.slice(0, 8));
    setRelatedActions(actions.slice(0, 8));
  }, [id, refreshToken]);

  useEffect(() => {
    if (!id || thread) return;

    let active = true;
    setLoading(true);

    getThreadFromBackend(id)
      .then((payload) => {
        if (!active) return;
        saveThread(payload);
        setThread(getThreadById(id));
      })
      .catch((error) => {
        if (!(error instanceof BackendUnavailableError)) {
          console.warn("Thread detail fetch unavailable.", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, thread]);

  const linkedPeople = useMemo(() => {
    const seen = new Map<string, { id: string; display_name: string; relationship: string; type: string }>();
    relatedQiBits.forEach((qibit) => {
      qibit.linkedPeople?.forEach((person) => {
        if (!seen.has(person.id)) {
          seen.set(person.id, person);
        }
      });
    });
    return Array.from(seen.values()).slice(0, 8);
  }, [relatedQiBits]);

  const timelineLink = useMemo(() => {
    if (!thread) return "/timeline";
    return `/timeline?thread=${encodeURIComponent(thread.id)}`;
  }, [thread]);

  function startRelatedCapture() {
    if (!thread) return;
    navigate("/capture", {
      state: {
        prefill: `Thread: ${thread.title}\n`,
      },
    });
  }

  if (!thread) {
    return (
      <div className="page-stack">
        <section className="desk-banner">
          <div>
            <div className="section-tag subdued">Thread</div>
            <h2>{loading ? "Loading thread" : "Thread not found"}</h2>
            <p>{loading ? "Checking backend and local storage for this thread." : "The requested thread is not available in the current local data set."}</p>
          </div>
        </section>
        <section className="card dense-card">
          <StateEmpty icon={<Layers3 size={24} />} text={loading ? "Looking up thread details." : "Open Threads to continue from an existing situation."} />
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="desk-banner detail-banner">
        <div className="stack-sm">
          <div className="compact-row wrap-gap">
            <span className="section-tag subdued">Thread</span>
            <span className={`badge badge-${thread.status.replace(/_/g, "_")}`}>{thread.status.replace(/_/g, " ")}</span>
            <span className="badge badge-bucket">{thread.bucket_code}</span>
            <span className="badge badge-type">{thread.priority}</span>
          </div>
          <h2>{thread.title}</h2>
          <p>{thread.description || "No thread description saved yet."}</p>
          <div className="item-meta">
            <span className="item-sub">Started {formatDate(thread.started_at)}</span>
            <span className="item-sub">{formatRelative(thread.started_at)}</span>
            {thread.updated_at ? <span className="item-sub">Updated {formatDate(thread.updated_at)}</span> : null}
          </div>
        </div>

        <div className="action-row detail-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
          <Link to="/threads" className="btn btn-outline">
            <Layers3 size={16} />
            All Threads
          </Link>
          <Link to={timelineLink} className="btn btn-outline">
            <History size={16} />
            Timeline
          </Link>
          <button type="button" className="btn btn-primary" onClick={startRelatedCapture}>
            <PlusCircle size={16} />
            Start related capture
          </button>
        </div>
      </section>

      <div className="two-col detail-grid">
        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Thread Record</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Description</span>
            <div className="raw-panel">{thread.description || "No description saved."}</div>
          </div>

          <div className="detail-block">
            <span className="form-label">Next Action</span>
            <span>{thread.next_action ?? "No next action assigned."}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Due Date</span>
            <span>{thread.due_date ? formatDate(thread.due_date) : "No due date set."}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Tags</span>
            <div className="item-meta">
              {thread.tags_json.length > 0 ? (
                thread.tags_json.map((tag) => (
                  <Link key={tag} to={`/timeline?tag=${encodeURIComponent(tag)}`} className="chip-link">
                    #{tag}
                  </Link>
                ))
              ) : (
                <span className="compact-text">No tags on this thread.</span>
              )}
            </div>
          </div>
        </section>

        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Linked Records</span>
          </div>

          <div className="detail-block">
            <span className="form-label">QiBits</span>
            {relatedQiBits.length > 0 ? (
              <div className="stack-sm">
                {relatedQiBits.map((qibit) => (
                  <Link key={qibit.id} to={`/qibits/${qibit.id}`} className="record-link-card">
                    <div className="compact-row spread">
                      <strong>{qibit.title}</strong>
                      <span className="badge badge-type">{qibit.type}</span>
                    </div>
                    <div className="compact-text">{qibit.summary}</div>
                    <div className="item-meta">
                      <span className={`badge badge-${qibit.priority}`}>{qibit.priority}</span>
                      <span className="item-sub">{formatRelative(qibit.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <span className="compact-text">No QiBits are linked to this thread yet.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Actions</span>
            {relatedActions.length > 0 ? (
              <div className="stack-sm">
                {relatedActions.map((action) => (
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
              <span className="compact-text">No actions are linked to this thread yet.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Related Timeline</span>
            <Link to={timelineLink} className="chip-link">
              Open timeline for this thread
            </Link>
          </div>

          <div className="detail-block">
            <span className="form-label">People</span>
            {linkedPeople.length > 0 ? (
              <div className="item-meta">
                {linkedPeople.map((person) => (
                  <Link key={person.id} to={`/people/${person.id}`} className="chip-link">
                    {person.display_name}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="compact-text">No linked people surfaced yet.</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
