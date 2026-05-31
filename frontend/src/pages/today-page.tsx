import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Action, TimelineRow } from "../types";
import { StateEmpty } from "./shared";
import { formatRelative } from "../utils/format";
import { getActions, getTimelineItems, updateAction } from "../utils/storage";
import { CheckCircle, History, Zap, FileText, DollarSign, Calendar, Heart, Circle, Plus, Brain } from "lucide-react";

type Props = { refreshToken: number };

export function TodayPage({ refreshToken }: Props) {
  const [timelineData, setTimelineData] = useState<TimelineRow[]>([]);
  const [actionsData, setActionsData] = useState<Action[]>([]);
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    setTimelineData(getTimelineItems());
    setActionsData(getActions());
  }, [refreshToken, localRefresh]);

  function toggleActionStatus(id: string, currentStatus: string) {
    updateAction(id, { status: currentStatus === "open" ? "done" : "open" });
    setLocalRefresh(n => n + 1);
  }

  const today = new Date().toDateString();
  const recentTimeline = timelineData.slice(0, 5);
  
  const recentQiBits = timelineData
    .filter(r => r.record_type === "qibits")
    .slice(0, 3);
    
  const openActions = actionsData
    .filter(a => a.status === "open")
    .slice(0, 5);
    
  const insights = timelineData
    .filter(r => r.payload?.insight)
    .slice(0, 2);

  return (
    <div className="page-stack">
      <section className="hero-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="section-tag">Today · {today}</div>
          <h2>Run life from the spine.</h2>
          <p>
            Scheduled work, open loops, and the live timeline signal in one command view.
          </p>
        </div>
        <Link to="/capture" className="btn btn-accent" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: "16px" }}>
          <Plus size={20} />
          New Capture
        </Link>
      </section>

      <div className="two-col">
        {/* Open Actions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Open Actions</span>
            <span className="card-count">{openActions.length}</span>
          </div>
          {openActions.length === 0 ? (
            <StateEmpty icon={<CheckCircle size={24} />} text="No open actions." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {openActions.map(a => (
                <div key={a.id} className="item-row">
                  <input 
                    type="checkbox" 
                    checked={false} 
                    onChange={() => toggleActionStatus(a.id, a.status)}
                    style={{ width: 16, height: 16, marginTop: 4 }} 
                  />
                  <div className="item-main">
                    <div className="item-title">{a.title}</div>
                    <div className="item-meta" style={{ marginTop: 4 }}>
                      <span className="badge badge-open">Priority: {a.priority}</span>
                      {a.dueHint && <span className="badge badge-triaged">Due: {a.dueHint}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Agent Insights */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Agent Insights</span>
            <span className="card-count">{insights.length}</span>
          </div>
          {insights.length === 0 ? (
            <StateEmpty icon={<Brain size={24} />} text="Capture something to get insights." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {insights.map(r => (
                <div key={r.id} style={{ background: "rgba(10, 132, 255, 0.05)", padding: "10px 12px", borderRadius: "var(--r-sm)", borderLeft: "2px solid var(--accent-blue)" }}>
                  <div style={{ fontSize: 13, color: "var(--ink-700)" }}>{r.payload?.insight as string}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 6 }}>From: {r.title} ({formatRelative(r.timestamp)})</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="two-col">
        {/* Recent QiBits */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent QiBits</span>
            <span className="card-count">{recentQiBits.length}</span>
          </div>
          {recentQiBits.length === 0 ? (
            <StateEmpty icon={<Zap size={24} />} text="No QiBits captured yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentQiBits.map((row) => (
                <TimelineEntry key={`${row.record_type}-${row.id}`} row={row} />
              ))}
            </div>
          )}
        </div>

        {/* Timeline Snapshot */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Timeline Snapshot</span>
            <span className="card-count">{timelineData.length} entries</span>
          </div>
          {recentTimeline.length === 0 ? (
            <StateEmpty icon={<History size={24} />} text="Timeline is empty." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentTimeline.map((row) => (
                <TimelineEntry key={`${row.record_type}-${row.id}`} row={row} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineEntry({ row }: { row: TimelineRow }) {
  const renderIcon = (type: string) => {
    switch (type) {
      case "qibits": return <Zap size={18} />;
      case "actions": return <CheckCircle size={18} />;
      case "transactions": return <DollarSign size={18} />;
      case "events": return <Calendar size={18} />;
      case "daily_summaries": return <FileText size={18} />;
      case "care": return <Heart size={18} />;
      default: return <Circle size={18} />;
    }
  };

  return (
    <div className="timeline-entry">
      <div className={`timeline-icon timeline-icon-${row.record_type}`}>
        {renderIcon(row.record_type)}
      </div>
      <div className="timeline-body">
        <div className="item-title">{row.title}</div>
        <div className="item-meta">
          <span className="badge badge-type">{row.record_type.replace("_", " ")}</span>
          <span className="badge badge-bucket">{(row.payload?.priority as string) || "low"}</span>
        </div>
      </div>
      <div className="timeline-time" style={{ whiteSpace: "nowrap" }}>{formatRelative(row.timestamp)}</div>
    </div>
  );
}
