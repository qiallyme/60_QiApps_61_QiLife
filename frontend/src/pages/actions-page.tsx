import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Action, QiBit } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getActions, getQiBits, updateAction } from "../utils/storage";
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
    updateAction(action.id, { status: action.status === "open" ? "done" : "open" });
    setLocalRefresh((value) => value + 1);
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Actions</div>
          <h2>Generated work orders.</h2>
          <p>These actions come from saved QiBits. Mark them done here without losing the source context.</p>
        </div>
      </section>

      <section className="card dense-card stack-md">
        <div className="filter-bar">
          <div className="compact-row">
            {(Object.entries(counts) as Array<[string, number]>).map(([status, count]) => (
              <button
                key={status}
                type="button"
                className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-ghost"}`}
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
          <div className="stack-md">
            {visible.map((action) => (
              <article key={action.id} className="timeline-record">
                <div className="compact-row spread">
                  <label className="compact-row">
                    <input type="checkbox" checked={action.status === "done"} onChange={() => toggleStatus(action)} />
                    <strong>{action.title}</strong>
                  </label>
                  <span className={`badge ${action.status === "done" ? "badge-bucket" : "badge-open"}`}>{action.status}</span>
                </div>

                <div className="item-meta">
                  <span className="badge badge-open">{action.priority}</span>
                  {action.dueHint ? <span className="badge badge-triaged">{action.dueHint}</span> : null}
                  <span className="badge badge-bucket">{qibitTitleById.get(action.qibitId ?? "") ?? "Unlinked capture"}</span>
                </div>

                <div className="compact-text">{action.sourceText ?? "No source text captured."}</div>

                <div className="item-meta">
                  <span className="item-sub">Created {formatRelative(action.createdAt)}</span>
                  <span className="item-sub">{formatDate(action.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
