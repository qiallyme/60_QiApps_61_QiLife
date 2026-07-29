import { useEffect, useMemo, useState } from "react";
import { RecordList } from "../../features/qilife/components/RecordList";
import { listAllRecords } from "../../features/qilife/services/qilifeStore";
import { readRelationIds } from "../../features/qilife/relations/relationshipFields";
import { recordRoute } from "../../features/qilife/utils/recordDisplay";
import type { QiRecord } from "../../features/qilife/types";
import { projectToday, type TodayProjection } from "./services/todayProjection";

function titleFor(records: QiRecord[], id: string | null) {
  return id ? records.find((record) => record.id === id)?.title ?? id : "";
}

function sectionItems(records: QiRecord[], allRecords: QiRecord[]) {
  return records.map((record) => {
    const projectId = readRelationIds(record.data, "project", "project")[0];
    const personId = readRelationIds(record.data, "person", "person")[0] ?? readRelationIds(record.data, "person", "owner")[0];
    return {
      id: record.id,
      entityKey: record.entity_key,
      title: record.title,
      metadata: [
        projectId ? `Project: ${titleFor(allRecords, projectId)}` : "",
        personId ? `Person: ${titleFor(allRecords, personId)}` : "",
      ].filter(Boolean).join(" · "),
      status: record.status ?? null,
      priority: record.priority ?? null,
      dateLabel: record.due_date ? `Due ${record.due_date.slice(0, 10)}` : null,
      to: recordRoute(record) ?? undefined,
    };
  });
}

function Section({ title, records, allRecords }: { title: string; records: QiRecord[]; allRecords: QiRecord[] }) {
  if (!records.length) return null;
  return (
    <section className="qilife-panel today-section">
      <div className="qilife-section-heading">
        <h2>{title}</h2>
        <span>{records.length}</span>
      </div>
      <RecordList ariaLabel={title} items={sectionItems(records, allRecords)} />
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
    () => (loading ? null : projectToday(records, new Date().toISOString().slice(0, 10))),
    [loading, records],
  );
  const total = projection ? Object.values(projection).reduce((sum, items) => sum + items.length, 0) : 0;

  return (
    <main className="qilife-page">
      <header className="qilife-page-header">
        <div>
          <div className="qilife-eyebrow">PLANNER</div>
          <h1>Today</h1>
          <p>What needs attention now, drawn from the records that own the work.</p>
        </div>
      </header>
      {loading && <div className="qilife-empty">Building today’s view…</div>}
      {error && <div className="qilife-error" role="alert">{error}</div>}
      {projection && !error && total === 0 && <div className="qilife-empty"><h2>You’re clear for now.</h2><p>No due, waiting, blocked, follow-up, recent, or inbox records need attention.</p></div>}
      {projection && !error && total > 0 && (
        <div className="qilife-dashboard-grid">
          <Section title="Overdue Actions" records={projection.overdueActions} allRecords={records} />
          <Section title="Due today" records={projection.dueTodayActions} allRecords={records} />
          <Section title="Upcoming Actions" records={projection.upcomingActions} allRecords={records} />
          <Section title="Waiting Actions" records={projection.waitingActions} allRecords={records} />
          <Section title="Blocked Actions" records={projection.blockedActions} allRecords={records} />
          <Section title="Blocked or at-risk Projects" records={projection.atRiskProjects} allRecords={records} />
          <Section title="People needing follow-up" records={projection.peopleNeedingFollowUp} allRecords={records} />
          <Section title="Software renewals and verification" records={projection.softwareAttention} allRecords={records} />
          <Section title="Stale identifiers" records={projection.staleIdentifiers} allRecords={records} />
          <Section title="Unresolved support" records={projection.unresolvedSupport} allRecords={records} />
          <Section title="Recent meaningful activity" records={projection.recentActivity} allRecords={records} />
          <Section title="Unprocessed Inbox" records={projection.inboxItems} allRecords={records} />
        </div>
      )}
    </main>
  );
}
