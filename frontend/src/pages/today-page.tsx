import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Brain, CheckCircle2, Clock3, FileText, History, Inbox } from "lucide-react";
import type { Action, Draft, QiBit, TimelineRow } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getActions, getPendingDraft, getQiBits, getTimelineItems, updateAction } from "../utils/storage";
import { StateEmpty } from "./shared";

type Props = { refreshToken: number };

export function TodayPage({ refreshToken }: Props) {
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);
  const [qibits, setQiBits] = useState<QiBit[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    setPendingDraft(getPendingDraft());
    setQiBits(getQiBits());
    setActions(getActions());
    setTimeline(getTimelineItems());
  }, [refreshToken, localRefresh]);

  const openActions = actions.filter((action) => action.status === "open").slice(0, 6);
  const recentQiBits = qibits.slice(0, 4);
  const recentTimeline = timeline.slice(0, 5);
  const insights = qibits.filter((qibit) => qibit.insight).slice(0, 3);

  const nextStep = pendingDraft
    ? "Review the pending draft before you capture something else."
    : openActions[0]
      ? `Start with: ${openActions[0].title}`
      : recentQiBits[0]
        ? `Latest saved QiBit: ${recentQiBits[0].title}`
        : "Capture the first item for today.";

  function toggleActionStatus(action: Action) {
    updateAction(action.id, { status: action.status === "open" ? "done" : "open" });
    setLocalRefresh((value) => value + 1);
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Today</div>
          <h2>What needs attention now?</h2>
          <p>{nextStep}</p>
        </div>
        <Link to="/capture" className="btn btn-primary">
          New Capture
        </Link>
      </section>

      <div className="stats-grid">
        <div className="card dense-card">
          <div className="compact-row spread">
            <span className="card-title">Pending Review</span>
            <span className="card-count">{pendingDraft ? 1 : 0}</span>
          </div>
          {pendingDraft ? (
            <div className="stack-xs compact-text">
              <strong>{pendingDraft.agentDraft.suggestedTitle}</strong>
              <span>{pendingDraft.agentDraft.suggestedSummary}</span>
              <Link to="/review" className="inline-link">
                Open review <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <span className="compact-text">No draft waiting.</span>
          )}
        </div>

        <div className="card dense-card">
          <div className="compact-row spread">
            <span className="card-title">Recent Capture</span>
            <span className="card-count">{recentQiBits.length}</span>
          </div>
          {recentQiBits[0] ? (
            <div className="stack-xs compact-text">
              <strong>{recentQiBits[0].title}</strong>
              <span>{recentQiBits[0].summary}</span>
              <span>{formatRelative(recentQiBits[0].createdAt)}</span>
            </div>
          ) : (
            <span className="compact-text">Nothing saved yet.</span>
          )}
        </div>

        <div className="card dense-card">
          <div className="compact-row spread">
            <span className="card-title">Open Actions</span>
            <span className="card-count">{openActions.length}</span>
          </div>
          <span className="compact-text">{openActions[0]?.title ?? "No open actions."}</span>
        </div>

        <div className="card dense-card">
          <div className="compact-row spread">
            <span className="card-title">Recent Changes</span>
            <span className="card-count">{recentTimeline.length}</span>
          </div>
          <span className="compact-text">{recentTimeline[0] ? `${recentTimeline[0].title} • ${formatRelative(recentTimeline[0].timestamp)}` : "Timeline is empty."}</span>
        </div>
      </div>

      <div className="two-col">
        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Open Actions</span>
            <span className="card-count">{openActions.length}</span>
          </div>

          {openActions.length === 0 ? (
            <StateEmpty icon={<CheckCircle2 size={22} />} text="No open actions." />
          ) : (
            <div className="stack-sm">
              {openActions.map((action) => (
                <div key={action.id} className="item-row dense-row">
                  <input type="checkbox" checked={action.status === "done"} onChange={() => toggleActionStatus(action)} />
                  <div className="item-main">
                    <div className="item-title">{action.title}</div>
                    <div className="item-meta">
                      <span className="badge badge-open">{action.priority}</span>
                      {action.dueHint ? <span className="badge badge-triaged">{action.dueHint}</span> : null}
                      <span className="item-sub">{formatRelative(action.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Recent QiBits</span>
            <span className="card-count">{recentQiBits.length}</span>
          </div>

          {recentQiBits.length === 0 ? (
            <StateEmpty icon={<Inbox size={22} />} text="No saved QiBits yet." />
          ) : (
            <div className="stack-sm">
              {recentQiBits.map((qibit) => (
                <div key={qibit.id} className="stack-xs">
                  <div className="compact-row spread">
                    <strong>{qibit.title}</strong>
                    <span className="badge badge-type">{qibit.type}</span>
                  </div>
                  <div className="compact-text">{qibit.summary}</div>
                  <div className="item-meta">
                    <span className="badge badge-open">{qibit.priority}</span>
                    <span className="badge badge-bucket">{qibit.space}</span>
                    <span className="item-sub">{formatDate(qibit.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="two-col">
        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Agent Insights</span>
            <span className="card-count">{insights.length}</span>
          </div>

          {insights.length === 0 ? (
            <StateEmpty icon={<Brain size={22} />} text="Insights appear after review and save." />
          ) : (
            <div className="stack-sm">
              {insights.map((qibit) => (
                <div key={qibit.id} className="insight-row">
                  <Brain size={16} />
                  <div className="stack-xs">
                    <strong>{qibit.title}</strong>
                    <span className="compact-text">{qibit.insight}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Timeline Summary</span>
            <span className="card-count">{recentTimeline.length}</span>
          </div>

          {recentTimeline.length === 0 ? (
            <StateEmpty icon={<History size={22} />} text="Timeline is empty." />
          ) : (
            <div className="stack-sm">
              {recentTimeline.map((item) => (
                <div key={item.id} className="compact-row top">
                  <Clock3 size={16} />
                  <div className="stack-xs">
                    <strong>{item.title}</strong>
                    <span className="compact-text">{item.payload.summary ?? "No summary saved."}</span>
                    <div className="item-meta">
                      <span className="badge badge-type">{item.payload.type ?? "note"}</span>
                      <span className="badge badge-bucket">{item.payload.space ?? item.bucket_code}</span>
                      <span className="item-sub">{formatRelative(item.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card dense-card">
        <div className="card-header">
          <span className="card-title">What Should I Do Next?</span>
        </div>
        <div className="stack-xs compact-text">
          <div className="compact-row">
            <AlertCircle size={16} />
            <span>{nextStep}</span>
          </div>
          <div className="compact-row">
            <FileText size={16} />
            <span>{pendingDraft ? "Save or discard the current draft before adding another." : "If something new happened, capture it immediately so the draft can create structure."}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
