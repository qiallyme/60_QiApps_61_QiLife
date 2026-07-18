import { useEffect, useMemo, useState } from "react";
import { entityRegistry, entityList } from "../data/entityRegistry";
import { listAllRecords } from "../services/qilifeStore";
import type { QiRecord } from "../types";

interface HomeDashboardProps {
  onOpenEntity: (entityKey: string, record?: QiRecord) => void;
  onOpenAssistant: () => void;
  refreshToken: number;
}

const dashboardCards = [
  { title: "Inbox", description: "Unprocessed thoughts, messages, evidence, notes, and loose inputs.", entityKey: "qibit" },
  { title: "Today", description: "Tasks, reminders, and appointments that need attention.", entityKey: "task" },
  { title: "Threads", description: "Ongoing situations that cross people, projects, files, and events.", entityKey: "thread" },
  { title: "Life Record", description: "Calls, incidents, payments, work sessions, and what actually happened.", entityKey: "event" },
  { title: "Journal", description: "Reflection, lessons, dreams, working notes, and after-action reviews.", entityKey: "journal_entry" },
  { title: "QiVault", description: "Markdown knowledge, doctrine, references, procedures, and research.", entityKey: "knowledge_item" },
  { title: "Decisions", description: "Choices, rationale, assumptions, risks, review dates, and outcomes.", entityKey: "decision" },
  { title: "Reports", description: "Daily, weekly, monthly, project, timeline, and evidence reports.", entityKey: "report" }
];

function isDueSoon(record: QiRecord) {
  const date = record.due_date || String(record.data.when || record.data.deadline || record.data.review_date || "");
  if (!date) return false;
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return false;
  const now = new Date();
  const sevenDays = 1000 * 60 * 60 * 24 * 7;
  return target.getTime() <= now.getTime() + sevenDays;
}

function isOpen(record: QiRecord) {
  return !["done", "completed", "cancelled", "resolved", "closed", "archived"].includes(
    String(record.status || "").toLowerCase()
  );
}

export function HomeDashboard({ onOpenEntity, onOpenAssistant, refreshToken }: HomeDashboardProps) {
  const [records, setRecords] = useState<QiRecord[]>([]);

  useEffect(() => {
    listAllRecords().then(setRecords).catch((error) => console.warn(error));
  }, [refreshToken]);

  const stats = useMemo(() => {
    const byEntity = new Map<string, number>();
    records.forEach((record) => byEntity.set(record.entity_key, (byEntity.get(record.entity_key) || 0) + 1));
    return {
      total: records.length,
      inbox: byEntity.get("qibit") || 0,
      open: records.filter(isOpen).length,
      dueSoon: records.filter(isDueSoon).length
    };
  }, [records]);

  const recent = records.slice(0, 7);

  return (
    <div className="qilife-page">
      <section className="qilife-hero">
        <div className="qilife-eyebrow">LIFE OPERATING SYSTEM</div>
        <h2>What matters now?</h2>
        <p>
          Capture what enters, connect what belongs together, preserve what happened,
          and turn the whole system into clear next action.
        </p>
        <div className="qilife-actions" style={{ marginTop: 16 }}>
          <button className="qilife-btn primary" type="button" onClick={onOpenAssistant}>✦ Ask QiLife</button>
          <button className="qilife-btn" type="button" onClick={() => onOpenEntity("qibit")}>Open Inbox</button>
        </div>
      </section>

      <section className="qilife-stat-grid">
        <div className="qilife-stat-card"><span>Total records</span><strong>{stats.total}</strong></div>
        <div className="qilife-stat-card"><span>Inbox</span><strong>{stats.inbox}</strong></div>
        <div className="qilife-stat-card"><span>Open loops</span><strong>{stats.open}</strong></div>
        <div className="qilife-stat-card"><span>Due soon</span><strong>{stats.dueSoon}</strong></div>
      </section>

      <section className="qilife-card-grid">
        {dashboardCards.map((card) => {
          const entity = entityRegistry[card.entityKey];
          const count = records.filter((record) => record.entity_key === card.entityKey).length;

          return (
            <button key={card.entityKey} className="qilife-card" type="button" onClick={() => onOpenEntity(card.entityKey)}>
              <div className="qilife-card-icon">{entity?.icon}</div>
              <div className="qilife-card-title">{card.title}</div>
              <div className="qilife-card-desc">{card.description}</div>
              <div className="qilife-card-meta">{count} {entity?.plural}</div>
            </button>
          );
        })}
      </section>

      <section className="qilife-split-section">
        <div className="qilife-panel">
          <div className="qilife-panel-head">
            <div>
              <div className="qilife-eyebrow">RECENT</div>
              <h3>Latest records</h3>
            </div>
          </div>

          {recent.length === 0 ? (
            <div className="qilife-empty compact">No records yet.</div>
          ) : (
            <div className="qilife-list">
              {recent.map((record) => (
                <button
                  key={record.id}
                  className="qilife-list-row"
                  type="button"
                  onClick={() => onOpenEntity(record.entity_key, record)}
                >
                  <span>{entityRegistry[record.entity_key]?.icon || "•"}</span>
                  <div>
                    <strong>{record.title}</strong>
                    <small>{entityRegistry[record.entity_key]?.label || record.entity_key}</small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="qilife-panel">
          <div className="qilife-panel-head">
            <div>
              <div className="qilife-eyebrow">SYSTEM MAP</div>
              <h3>Available modules</h3>
            </div>
          </div>
          <div className="qilife-chip-cloud">
            {entityList.map((entity) => (
              <button key={entity.key} type="button" onClick={() => onOpenEntity(entity.key)}>
                {entity.icon} {entity.plural}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
