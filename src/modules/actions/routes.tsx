import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RecordList } from "../../features/qilife/components/RecordList";
import { listRecords } from "../../features/qilife/services/qilifeStore";
import type { QiRecord } from "../../features/qilife/types";
import { ActionForm, emptyAction } from "./components/ActionForm";
import { filterActions } from "./services/actionFilters";
import { actionRepository } from "./services/actionRepository";
import type { Action, ActionFilters } from "./types";

function titleFor(records: QiRecord[], id: string | null) {
  return id ? records.find((record) => record.id === id)?.title ?? id : "";
}

export function ActionsIndexRoute() {
  const [actions, setActions] = useState<Action[]>([]);
  const [records, setRecords] = useState<QiRecord[]>([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ActionFilters>({
    query: "",
    status: "",
    projectId: "",
    personId: "",
    due: "",
    today: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    Promise.all([actionRepository.list(), listRecords("project"), listRecords("person")])
      .then(([items, projects, people]) => {
        setActions(items);
        setRecords([...projects, ...people]);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load Actions."));
  }, []);

  const visible = useMemo(() => filterActions(actions, filters), [actions, filters]);
  const items = visible.map((action) => ({
    id: action.id,
    entityKey: "task",
    title: action.title,
    metadata: [
      action.projectId ? `Project: ${titleFor(records, action.projectId)}` : "",
      action.peopleIds.length ? `People: ${action.peopleIds.map((id) => titleFor(records, id)).join(", ")}` : "",
      action.threadId ? `Thread: ${titleFor(records, action.threadId)}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
    status: action.status,
    priority: action.priority,
    dateLabel: action.dueDate ? `Due ${action.dueDate}` : null,
    to: `/actions/${action.id}`,
  }));

  return (
    <main className="qilife-page">
      <header className="qilife-page-header">
        <div>
          <div className="qilife-eyebrow">PLANNER</div>
          <h1>Actions</h1>
        </div>
        <Link className="qilife-btn primary" to="/actions/new">New Action</Link>
      </header>
      <div className="qilife-filter-row">
        <input aria-label="Search Actions" placeholder="Search Actions..." value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
        <select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {["inbox", "next", "waiting", "blocked", "done"].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Project" value={filters.projectId} onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}>
          <option value="">All projects</option>
          {records.filter((record) => record.entity_key === "project").map((record) => <option key={record.id} value={record.id}>{record.title}</option>)}
        </select>
        <select aria-label="Person" value={filters.personId} onChange={(e) => setFilters({ ...filters, personId: e.target.value })}>
          <option value="">All people</option>
          {records.filter((record) => record.entity_key === "person").map((record) => <option key={record.id} value={record.id}>{record.title}</option>)}
        </select>
        <select aria-label="Due" value={filters.due} onChange={(e) => setFilters({ ...filters, due: e.target.value as ActionFilters["due"] })}>
          <option value="">Any due date</option>
          <option value="due">Due today</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      {error && <div className="qilife-error">{error}</div>}
      {!error && <RecordList ariaLabel="Actions" emptyMessage="No Actions match these filters." items={items} />}
    </main>
  );
}

export function ActionNewRoute() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = {
    ...emptyAction,
    projectId: params.get("projectId"),
    peopleIds: params.get("personId") ? [params.get("personId")!] : [],
  };
  return (
    <main className="qilife-page">
      <h1>New Action</h1>
      <ActionForm
        initial={initial}
        onCancel={() => navigate("/actions")}
        onSave={async (draft) => {
          const action = await actionRepository.create(draft);
          navigate(`/actions/${action.id}`, { replace: true });
        }}
      />
    </main>
  );
}

export function ActionDetailRoute() {
  const { id = "" } = useParams();
  const [action, setAction] = useState<Action | null | undefined>();
  const [records, setRecords] = useState<QiRecord[]>([]);

  useEffect(() => {
    Promise.all([actionRepository.get(id), listRecords("project"), listRecords("person"), listRecords("thread")])
      .then(([item, ...related]) => {
        setAction(item);
        setRecords(related.flat());
      });
  }, [id]);

  if (action === undefined) return <main className="qilife-page"><div className="qilife-empty">Loading Action...</div></main>;
  if (!action) return <main className="qilife-page"><div className="qilife-error">Action not found or inaccessible.</div><Link to="/actions">Back to Actions</Link></main>;

  return (
    <main className="qilife-page">
      <header className="qilife-page-header">
        <div>
          <div className="qilife-eyebrow">ACTION</div>
          <h1>{action.title}</h1>
        </div>
        <Link to="/actions">Back to Actions</Link>
      </header>
      <section className="qilife-panel">
        <p><strong>Status:</strong> {action.status}</p>
        <p><strong>Priority:</strong> {action.priority}</p>
        <p><strong>Due:</strong> {action.dueDate || "No due date"}</p>
        {action.projectId && <p><strong>Project:</strong> <Link to={`/projects/${action.projectId}`}>{titleFor(records, action.projectId)}</Link></p>}
        {action.peopleIds.map((personId) => <p key={personId}><strong>Person:</strong> <Link to={`/people/${personId}`}>{titleFor(records, personId)}</Link></p>)}
        {action.threadId && <p><strong>Thread:</strong> <Link to={`/threads/${action.threadId}`}>{titleFor(records, action.threadId)}</Link></p>}
        <p>{action.notes}</p>
      </section>
    </main>
  );
}
