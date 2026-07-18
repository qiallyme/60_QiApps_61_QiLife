import { useEffect, useMemo, useState } from "react";
import { entityRegistry } from "../data/entityRegistry";
import { listAllRecords } from "../services/qilifeStore";
import type { QiWorkspaceKey } from "../data/workspaceRegistry";
import type { QiRecord } from "../types";

interface HomeDashboardProps {
  onOpenEntity: (entityKey: string, record?: QiRecord) => void;
  onOpenWorkspace: (workspaceKey: QiWorkspaceKey) => void;
  onOpenAssistant: () => void;
  refreshToken: number;
}

const CLOSED = new Set(["done", "completed", "cancelled", "resolved", "closed", "archived"]);

function isOpen(record: QiRecord) {
  return !CLOSED.has(String(record.status || "").toLowerCase());
}

function recordDate(record: QiRecord): Date | null {
  const raw = record.due_date || record.data.when || record.data.deadline || record.data.review_date;
  if (!raw) return null;
  const date = new Date(String(raw));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isToday(record: QiRecord) {
  const date = recordDate(record);
  if (!date) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

function isUrgent(record: QiRecord) {
  const priority = String(record.priority || "").toLowerCase();
  const date = recordDate(record);
  return isOpen(record) && (
    priority === "urgent"
    || priority === "high"
    || Boolean(date && date.getTime() < Date.now())
  );
}

function RecordList({
  records,
  empty,
  onOpen
}: {
  records: QiRecord[];
  empty: string;
  onOpen: (record: QiRecord) => void;
}) {
  if (records.length === 0) return <div className="qilife-empty compact">{empty}</div>;

  return (
    <div className="qilife-list">
      {records.map((record) => (
        <button key={record.id} className="qilife-list-row" type="button" onClick={() => onOpen(record)}>
          <span>{entityRegistry[record.entity_key]?.icon || "•"}</span>
          <div>
            <strong>{record.title}</strong>
            <small>
              {entityRegistry[record.entity_key]?.label || record.entity_key}
              {record.status ? ` · ${record.status}` : ""}
            </small>
          </div>
        </button>
      ))}
    </div>
  );
}

export function HomeDashboard({
  onOpenEntity,
  onOpenWorkspace,
  onOpenAssistant,
  refreshToken
}: HomeDashboardProps) {
  const [records, setRecords] = useState<QiRecord[]>([]);

  useEffect(() => {
    listAllRecords().then(setRecords).catch(console.warn);
  }, [refreshToken]);

  const view = useMemo(() => {
    const open = records.filter(isOpen);
    return {
      now: open.filter(isUrgent).slice(0, 4),
      today: open.filter(isToday).slice(0, 6),
      inbox: records.filter((record) => record.entity_key === "qibit" && String(record.status || "inbox") === "inbox").slice(0, 5),
      waiting: open.filter((record) => String(record.status || "").toLowerCase() === "waiting").slice(0, 5),
      continue: open
        .filter((record) => ["task", "project", "thread"].includes(record.entity_key))
        .slice(0, 5),
      openCount: open.length
    };
  }, [records]);

  const primary = view.now[0] || view.today[0] || view.continue[0];

  return (
    <div className="qilife-page qilife-home">
      <section className="qilife-home-intro">
        <div>
          <div className="qilife-eyebrow">HOME</div>
          <h2>What matters now?</h2>
          <p>Quiet surface. Complete system underneath.</p>
        </div>
        <button className="qilife-ask-inline" type="button" onClick={onOpenAssistant}>
          <span>✦</span>
          <div><strong>Ask QiLife</strong><small>Search everything already captured</small></div>
        </button>
      </section>

      <section className="qilife-now-strip">
        <div>
          <div className="qilife-eyebrow">NOW</div>
          {primary ? (
            <button type="button" onClick={() => onOpenEntity(primary.entity_key, primary)}>
              <strong>{primary.title}</strong>
              <span>{primary.priority || primary.status || entityRegistry[primary.entity_key]?.label}</span>
            </button>
          ) : (
            <p>No active fire. Use the space.</p>
          )}
        </div>
        <div className="qilife-home-counts">
          <button type="button" onClick={() => onOpenWorkspace("today")}><strong>{view.openCount}</strong><span>open loops</span></button>
          <button type="button" onClick={() => onOpenEntity("qibit")}><strong>{view.inbox.length}</strong><span>in inbox</span></button>
          <button type="button" onClick={() => onOpenEntity("task")}><strong>{view.waiting.length}</strong><span>waiting</span></button>
        </div>
      </section>

      <section className="qilife-home-grid">
        <article className="qilife-panel">
          <div className="qilife-panel-head"><div><div className="qilife-eyebrow">TODAY</div><h3>Due and scheduled</h3></div><button type="button" onClick={() => onOpenWorkspace("today")}>Open</button></div>
          <RecordList records={view.today} empty="Nothing dated for today." onOpen={(record) => onOpenEntity(record.entity_key, record)} />
        </article>

        <article className="qilife-panel">
          <div className="qilife-panel-head"><div><div className="qilife-eyebrow">INBOX</div><h3>Sort later</h3></div><button type="button" onClick={() => onOpenEntity("qibit")}>Open</button></div>
          <RecordList records={view.inbox} empty="Inbox is clear." onOpen={(record) => onOpenEntity(record.entity_key, record)} />
        </article>

        <article className="qilife-panel">
          <div className="qilife-panel-head"><div><div className="qilife-eyebrow">CONTINUE</div><h3>Open work</h3></div><button type="button" onClick={() => onOpenWorkspace("projects")}>Open</button></div>
          <RecordList records={view.continue} empty="No active work yet." onOpen={(record) => onOpenEntity(record.entity_key, record)} />
        </article>

        <article className="qilife-panel">
          <div className="qilife-panel-head"><div><div className="qilife-eyebrow">WAITING</div><h3>Outside your hands</h3></div><button type="button" onClick={() => onOpenEntity("task")}>Open</button></div>
          <RecordList records={view.waiting} empty="Nothing is waiting." onOpen={(record) => onOpenEntity(record.entity_key, record)} />
        </article>
      </section>
    </div>
  );
}
