import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Action, QiBit } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getActions, getQiBits, updateActionStatus } from "../utils/storage";
import { StateEmpty } from "./shared";

export function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [qibits, setQiBits] = useState<QiBit[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    setActions(getActions());
    setQiBits(getQiBits());
  }, [localRefresh]);

  const qibitTitleById = new Map(qibits.map((qibit) => [qibit.id, qibit.title]));
  const visible = actions.filter((action) => statusFilter === "all" || action.status === statusFilter);

  const counts = {
    all: actions.length,
    open: actions.filter((action) => action.status === "open").length,
    done: actions.filter((action) => action.status === "done").length,
  };

  function toggleStatus(action: Action) {
    updateActionStatus(action.id, action.status === "open" ? "done" : "open");
    setLocalRefresh((value) => value + 1);
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Actions</div>
          <h2>Generated work orders.</h2>
          <p>Each action stays linked to the capture that created it. Open a record to see the full context before you close it.</p>
        </div>
      </section>

      <section className="card dense-card stack-md">
        <div className="filter-bar">
          <div className="filter-chip-row">
            {(Object.entries(counts) as Array<[string, number]>).map(([status, count]) => (
              <button
                key={status}
                type="button"
                className={`filter-chip ${statusFilter === status ? "is-active" : ""}`}
                onClick={() => setStatusFilter(status)}
              >
                {status} {count}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <StateEmpty icon={<CheckCircle2 size={24} />} text="No actions in this view." />
        ) : (
          <div className="stack-sm">
            {visible.map((action) => (
              <article key={action.id} className="record-surface">
                <div className="record-with-control">
                  <input
                    type="checkbox"
                    checked={action.status === "done"}
                    onChange={() => toggleStatus(action)}
                    aria-label={`Mark ${action.title} ${action.status === "open" ? "done" : "open"}`}
                  />

                  <div className="item-main stack-xs">
                    <Link to={`/actions/${action.id}`} className="record-link-card">
                      <div className="compact-row spread">
                        <strong>{action.title}</strong>
                        <span className={`badge ${action.status === "done" ? "badge-bucket" : "badge-open"}`}>{action.status}</span>
                      </div>

                      <div className="item-meta">
                        <span className={`badge badge-${action.priority}`}>{action.priority}</span>
                        {action.dueHint ? <span className="badge badge-triaged">{action.dueHint}</span> : null}
                        <span className="item-sub">Created {formatRelative(action.createdAt)}</span>
                      </div>

                      <div className="compact-text">{action.sourceText ?? "No source text captured."}</div>
                    </Link>

                    <div className="compact-row wrap-gap">
                      {action.qibitId ? (
                        <Link to={`/qibits/${action.qibitId}`} className="inline-link subtle-link">
                          {qibitTitleById.get(action.qibitId) ?? "Open linked QiBit"}
                        </Link>
                      ) : (
                        <span className="compact-text">Unlinked capture</span>
                      )}
                      <span className="item-sub">{formatDate(action.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="compact-row spread">
          <span className="compact-text">Select a record for full context and linked data.</span>
          <Link to="/timeline" className="inline-link">
            Open Timeline <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
