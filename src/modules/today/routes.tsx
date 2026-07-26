import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAllRecords } from "../../features/qilife/services/qilifeStore";
import type { QiRecord } from "../../features/qilife/types";
import { projectToday, type TodayProjection } from "./services/todayProjection";

const routes: Record<string, string> = {
  task: "/actions",
  project: "/projects",
  person: "/people",
  journal_entry: "/journal",
};

function RecordLink({ record }: { record: QiRecord }) {
  const prefix = routes[record.entity_key];
  return prefix
    ? <Link to={`${prefix}/${record.id}`}>{record.title}</Link>
    : <span>{record.title}</span>;
}

function Section({ title, records }: { title: string; records: QiRecord[] }) {
  if (!records.length) return null;
  return (
    <section className="qilife-panel today-section">
      <div className="qilife-section-heading"><h2>{title}</h2><span>{records.length}</span></div>
      <ul className="qilife-related-list">
        {records.map((record) => (
          <li key={record.id}>
            <RecordLink record={record} />
            {record.due_date && <time dateTime={record.due_date}>{record.due_date.slice(0, 10)}</time>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TodayRoute() {
  const [records, setRecords] = useState<QiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    listAllRecords()
      .then(setRecords)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load Today."))
      .finally(() => setLoading(false));
  }, []);
  const projection = useMemo<TodayProjection | null>(
    () => loading ? null : projectToday(records, new Date().toISOString().slice(0, 10)),
    [loading, records],
  );
  const total = projection ? Object.values(projection).reduce((sum, items) => sum + items.length, 0) : 0;

  return (
    <main className="qilife-page">
      <header className="qilife-page-header">
        <div><div className="qilife-eyebrow">PLANNER</div><h1>Today</h1><p>What needs attention now, drawn from the records that own the work.</p></div>
      </header>
      {loading && <div className="qilife-empty">Building today’s view…</div>}
      {error && <div className="qilife-error" role="alert">{error}</div>}
      {projection && !error && total === 0 && <div className="qilife-empty"><h2>You’re clear for now.</h2><p>No due, waiting, blocked, follow-up, recent, or inbox records need attention.</p></div>}
      {projection && !error && total > 0 && <div className="qilife-dashboard-grid">
        <Section title="Overdue Actions" records={projection.overdueActions} />
        <Section title="Due today" records={projection.dueTodayActions} />
        <Section title="Upcoming Actions" records={projection.upcomingActions} />
        <Section title="Waiting Actions" records={projection.waitingActions} />
        <Section title="Blocked Actions" records={projection.blockedActions} />
        <Section title="Blocked or at-risk Projects" records={projection.atRiskProjects} />
        <Section title="People needing follow-up" records={projection.peopleNeedingFollowUp} />
        <Section title="Recent meaningful activity" records={projection.recentActivity} />
        <Section title="Unprocessed Inbox" records={projection.inboxItems} />
      </div>}
    </main>
  );
}
