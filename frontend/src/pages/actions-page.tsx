import { useState, useEffect } from "react";
import type { Action } from "../types";
import { StateEmpty } from "./shared";
import { formatRelative } from "../utils/format";
import { getActions, updateAction } from "../utils/storage";

export function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    setActions(getActions());
  }, [localRefresh]);

  const visible = actions.filter(
    (a) => statusFilter === "all" || a.status === statusFilter
  );

  const counts = {
    all: actions.length,
    open: actions.filter((a) => a.status === "open").length,
    done: actions.filter((a) => a.status === "done").length,
  };

  function toggleStatus(id: string, currentStatus: string) {
    updateAction(id, { status: currentStatus === "open" ? "done" : "open" });
    setLocalRefresh(n => n + 1);
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="section-tag">Actions</div>
        <h2>Work orders derived from real life.</h2>
        <p>Actions are the executable layer. They are extracted by the agent from your captured QiBits.</p>
      </section>

      <div className="card">
        <div className="card-header">
          <div className="filter-bar" style={{ flex: 1 }}>
            {(Object.entries(counts) as [string, number][]).map(([s, n]) => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setStatusFilter(s)}
              >
                {s} <span style={{ opacity: 0.65, marginLeft: 3 }}>{n}</span>
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 && (
          <StateEmpty icon="◷" text="No actions in this view." />
        )}

        {visible.map((a) => (
          <div key={a.id} className="item-row">
            <input 
              type="checkbox" 
              checked={a.status === "done"} 
              onChange={() => toggleStatus(a.id, a.status)}
              style={{ width: 18, height: 18, marginTop: 2 }} 
            />
            <div className="item-main">
              <div className="item-title" style={{ textDecoration: a.status === "done" ? "line-through" : "none", opacity: a.status === "done" ? 0.6 : 1 }}>
                {a.title}
              </div>
              <div className="item-meta">
                <span className={`badge badge-${a.priority === "high" ? "waiting_on" : "bucket"}`}>
                  Priority: {a.priority}
                </span>
                {a.dueHint && (
                  <span className="badge badge-open">
                    Due: {a.dueHint}
                  </span>
                )}
                <span className="item-sub">Created {formatRelative(a.createdAt)}</span>
                {a.qibitId && (
                  <span className="badge badge-triaged">From Source</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
