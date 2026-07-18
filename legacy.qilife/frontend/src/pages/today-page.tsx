import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, BookOpen, Brain, CheckCircle2, Clock3, FileText, History, Inbox, LayoutDashboard, PlusCircle } from "lucide-react";
import { updateActionStatusOnBackend } from "../api/client";
import type { Action, Draft, QiBit, TimelineRow } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getActions, getPendingDraft, getPeople, getQiBits, getThreads, getTimelineItems, updateActionStatus } from "../utils/storage";
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
  const recentQiBits = qibits.filter((qibit) => qibit.status !== "new").slice(0, 4);
  const recentTimeline = timeline.slice(0, 5);
  const insights = qibits.filter((qibit) => qibit.status !== "new" && qibit.insight).slice(0, 3);
  const dueSoon = actions.filter((action) => action.status === "open" && action.dueHint).slice(0, 4);
  const waitingOn = qibits.filter((qibit) => qibit.status === "waiting_on").slice(0, 3);
  const slotted = qibits
    .filter((qibit) => qibit.status !== "new" && qibit.future_slot && qibit.future_slot !== "later")
    .slice(0, 4);
  const activeThreads = getThreads().filter((thread) => thread.status !== "closed").slice(0, 3);
  const people = getPeople().slice(0, 3);
  const qibitTitleById = new Map(qibits.map((qibit) => [qibit.id, qibit.title]));

  const nextStep = pendingDraft
    ? "Review the pending draft before you capture something else."
    : openActions[0]
      ? `Start with: ${openActions[0].title}`
      : recentQiBits[0]
        ? `Latest saved QiBit: ${recentQiBits[0].title}`
        : "Capture the first item for today.";

  async function toggleActionStatus(action: Action) {
    const nextStatus = action.status === "open" ? "done" : "open";
    try {
      await updateActionStatusOnBackend(action.id, nextStatus, action.dueHint, action.sourceText);
    } catch (error) {
      console.warn("Action status update falling back to local storage.", error);
    }
    updateActionStatus(action.id, nextStatus);
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

      <section className="command-grid">
        <Link to="/capture" className="card dense-card interactive-card command-card">
          <PlusCircle size={16} />
          <div className="stack-xs">
            <strong>Capture</strong>
            <span className="compact-text">Add a new raw record.</span>
          </div>
        </Link>
        <Link to="/review" className="card dense-card interactive-card command-card">
          <CheckCircle2 size={16} />
          <div className="stack-xs">
            <strong>Review</strong>
            <span className="compact-text">{pendingDraft ? "Approve the current draft." : "Review desk is clear."}</span>
          </div>
        </Link>
        <Link to="/actions" className="card dense-card interactive-card command-card">
          <Clock3 size={16} />
          <div className="stack-xs">
            <strong>Actions</strong>
            <span className="compact-text">{openActions.length} open work items.</span>
          </div>
        </Link>
        <Link to="/knowledge" className="card dense-card interactive-card command-card">
          <BookOpen size={16} />
          <div className="stack-xs">
            <strong>Knowledge</strong>
            <span className="compact-text">Open docs-backed reference.</span>
          </div>
        </Link>
        <Link to="/cockpit" className="card dense-card interactive-card command-card">
          <LayoutDashboard size={16} />
          <div className="stack-xs">
            <strong>Cockpit</strong>
            <span className="compact-text">Open launchers and private system surfaces.</span>
          </div>
        </Link>
      </section>

      <div className="stats-grid">
        <Link to="/review" className="card dense-card interactive-card">
          <div className="compact-row spread">
            <span className="card-title">Pending Review</span>
            <span className="card-count">{pendingDraft ? 1 : 0}</span>
          </div>
          {pendingDraft ? (
            <div className="stack-xs compact-text">
              <strong>{pendingDraft.agentDraft.suggestedTitle}</strong>
              <span>{pendingDraft.agentDraft.suggestedSummary}</span>
              <span className="inline-link">
                Open review <ArrowRight size={14} />
              </span>
            </div>
          ) : (
            <span className="compact-text">No draft waiting.</span>
          )}
        </Link>

        <Link to={recentQiBits[0] ? `/qibits/${recentQiBits[0].id}` : "/capture"} className="card dense-card interactive-card">
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
        </Link>

        <Link to={openActions[0] ? `/actions/${openActions[0].id}` : "/actions"} className="card dense-card interactive-card">
          <div className="compact-row spread">
            <span className="card-title">Open Actions</span>
            <span className="card-count">{openActions.length}</span>
          </div>
          <span className="compact-text">{openActions[0]?.title ?? "No open actions."}</span>
        </Link>

        <Link to={recentTimeline[0] ? `/qibits/${recentTimeline[0].payload.qibitId ?? recentTimeline[0].id}` : "/timeline"} className="card dense-card interactive-card">
          <div className="compact-row spread">
            <span className="card-title">Recent Changes</span>
            <span className="card-count">{recentTimeline.length}</span>
          </div>
          <span className="compact-text">{recentTimeline[0] ? `${recentTimeline[0].title} • ${formatRelative(recentTimeline[0].timestamp)}` : "Timeline is empty."}</span>
        </Link>
      </div>

      <div className="two-col">
        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Open Actions</span>
            <Link to="/actions" className="inline-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {openActions.length === 0 ? (
            <StateEmpty icon={<CheckCircle2 size={22} />} text="No open actions." />
          ) : (
            <div className="stack-sm">
              {openActions.map((action) => (
                <div key={action.id} className="record-with-control">
                  <input
                    type="checkbox"
                    checked={action.status === "done"}
                    onChange={() => toggleActionStatus(action)}
                    aria-label={`Mark ${action.title} ${action.status === "open" ? "done" : "open"}`}
                  />
                  <div className="item-main stack-xs">
                    <Link to={`/actions/${action.id}`} className="record-row-link">
                      <div className="item-title">{action.title}</div>
                      <div className="item-meta">
                        <span className={`badge badge-${action.priority}`}>{action.priority}</span>
                        {action.dueHint ? <span className="badge badge-triaged">{action.dueHint}</span> : null}
                        <span className="item-sub">{formatRelative(action.createdAt)}</span>
                      </div>
                    </Link>
                    {action.qibitId ? (
                      <Link to={`/qibits/${action.qibitId}`} className="inline-link subtle-link">
                        {qibitTitleById.get(action.qibitId) ?? "Open source QiBit"}
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Recent QiBits</span>
            <Link to="/timeline" className="inline-link">
              Timeline <ArrowRight size={14} />
            </Link>
          </div>

          {recentQiBits.length === 0 ? (
            <StateEmpty icon={<Inbox size={22} />} text="No saved QiBits yet." />
          ) : (
            <div className="stack-sm">
              {recentQiBits.map((qibit) => (
                <Link key={qibit.id} to={`/qibits/${qibit.id}`} className="record-link-card">
                  <div className="compact-row spread">
                    <strong>{qibit.title}</strong>
                    <span className="badge badge-type">{qibit.type}</span>
                  </div>
                  <div className="compact-text">{qibit.summary}</div>
                  <div className="item-meta">
                    <span className={`badge badge-${qibit.priority}`}>{qibit.priority}</span>
                    <span className="badge badge-bucket">{qibit.space}</span>
                    <span className="item-sub">{formatDate(qibit.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="two-col">
        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Due And Open Loops</span>
            <Link to="/actions" className="inline-link">
              Open queue <ArrowRight size={14} />
            </Link>
          </div>

          <div className="stack-sm">
            {dueSoon.length > 0 ? (
              dueSoon.map((action) => (
                <Link key={action.id} to={`/actions/${action.id}`} className="record-link-card">
                  <div className="compact-row spread">
                    <strong>{action.title}</strong>
                    <span className="badge badge-triaged">{action.dueHint}</span>
                  </div>
                  <div className="item-meta">
                    <span className={`badge badge-${action.priority}`}>{action.priority}</span>
                    {action.qibitId ? <span className="item-sub">{qibitTitleById.get(action.qibitId) ?? "Linked QiBit"}</span> : null}
                  </div>
                </Link>
              ))
            ) : (
              <span className="compact-text">No due hints are active right now.</span>
            )}

            {waitingOn.length > 0 ? (
              waitingOn.map((qibit) => (
                <Link key={qibit.id} to={`/qibits/${qibit.id}`} className="record-link-card">
                  <div className="compact-row spread">
                    <strong>{qibit.title}</strong>
                    <span className="badge badge-waiting_on">waiting on</span>
                  </div>
                  <div className="compact-text">{qibit.summary}</div>
                </Link>
              ))
            ) : null}
          </div>
        </section>

        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Scheduled And Slotted</span>
            <Link to="/timeline" className="inline-link">
              Open timeline <ArrowRight size={14} />
            </Link>
          </div>

          <div className="stack-sm">
            {slotted.length > 0 ? (
              slotted.map((qibit) => (
                <Link key={qibit.id} to={`/qibits/${qibit.id}`} className="record-link-card">
                  <div className="compact-row spread">
                    <strong>{qibit.title}</strong>
                    <span className="badge badge-triaged">{qibit.future_slot?.replace(/_/g, " ")}</span>
                  </div>
                  <div className="compact-text">{qibit.summary}</div>
                  <div className="item-meta">
                    <span className="badge badge-bucket">{qibit.space}</span>
                    {qibit.thread_id ? <span className="item-sub">Thread linked</span> : null}
                    {qibit.linkedPeople?.[0] ? <span className="item-sub">{qibit.linkedPeople[0].display_name}</span> : null}
                  </div>
                </Link>
              ))
            ) : (
              <span className="compact-text">No slotted QiBits yet. Use review to place work into today, tomorrow, this week, or next week.</span>
            )}
          </div>
        </section>
      </div>

      <div className="two-col">
        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Threads And People</span>
            <Link to="/threads" className="inline-link">
              View threads <ArrowRight size={14} />
            </Link>
          </div>

          <div className="stack-sm">
            {activeThreads.length > 0 ? (
              activeThreads.map((thread) => (
                <Link key={thread.id} to={`/threads/${thread.id}`} className="record-link-card">
                  <div className="compact-row spread">
                    <strong>{thread.title}</strong>
                    <span className={`badge badge-${thread.status.replace(/_/g, "_")}`}>{thread.status.replace(/_/g, " ")}</span>
                  </div>
                  <div className="item-meta">
                    <span className="badge badge-bucket">{thread.bucket_code}</span>
                    <span className="item-sub">{formatRelative(thread.started_at)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <span className="compact-text">No active threads yet.</span>
            )}

            {people.length > 0 ? (
              <div className="item-meta">
                {people.map((person) => (
                  <Link key={person.id} to={`/people/${person.id}`} className="chip-link">
                    {person.display_name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
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
                <Link key={qibit.id} to={`/qibits/${qibit.id}`} className="insight-row interactive-card">
                  <Brain size={16} />
                  <div className="stack-xs">
                    <strong>{qibit.title}</strong>
                    <span className="compact-text">{qibit.insight}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Timeline Summary</span>
            <Link to="/timeline" className="inline-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentTimeline.length === 0 ? (
            <StateEmpty icon={<History size={22} />} text="Timeline is empty." />
          ) : (
            <div className="stack-sm">
              {recentTimeline.map((item) => (
                <Link key={item.id} to={`/qibits/${item.payload.qibitId ?? item.id}`} className="record-link-card">
                  <div className="compact-row top">
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
                </Link>
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
          <div className="compact-row">
            <ArrowRight size={16} />
            <Link to={pendingDraft ? "/review" : openActions[0] ? `/actions/${openActions[0].id}` : "/capture"} className="inline-link">
              {pendingDraft ? "Open the review desk" : openActions[0] ? "Open the next action" : "Start a new capture"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
