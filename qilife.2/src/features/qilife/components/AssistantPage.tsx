import { useEffect, useMemo, useState } from "react";
import { entityRegistry } from "../data/entityRegistry";
import { listAllRecords } from "../services/qilifeStore";
import type { QiRecord } from "../types";

interface AssistantPageProps {
  onOpenEntity: (entityKey: string, record?: QiRecord) => void;
  refreshToken: number;
}

const STARTER_QUERIES = [
  "What needs attention?",
  "Show waiting items",
  "Find recent decisions",
  "What is due soon?"
];

const CLOSED = new Set(["done", "completed", "cancelled", "resolved", "closed", "archived"]);

function recordSearchText(record: QiRecord): string {
  return [
    record.title,
    record.entity_key,
    record.status,
    record.priority,
    record.due_date,
    JSON.stringify(record.data)
  ].filter(Boolean).join(" ").toLowerCase();
}

function recordDate(record: QiRecord): Date | null {
  const raw = record.due_date || record.data.when || record.data.deadline || record.data.review_date;
  if (!raw) return null;
  const date = new Date(String(raw));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isOpen(record: QiRecord): boolean {
  return !CLOSED.has(String(record.status || "").toLowerCase());
}

function textMatches(record: QiRecord, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 1);
  if (terms.length === 0) return true;
  const haystack = recordSearchText(record);
  return terms.every((term) => haystack.includes(term));
}

function queryRecords(records: QiRecord[], query: string): QiRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return records;

  if (normalized.includes("waiting")) {
    return records.filter((record) => isOpen(record) && String(record.status || "").toLowerCase() === "waiting");
  }

  if (normalized.includes("attention") || normalized.includes("urgent")) {
    return records.filter((record) => {
      if (!isOpen(record)) return false;
      const priority = String(record.priority || "").toLowerCase();
      const date = recordDate(record);
      return priority === "urgent" || priority === "high" || Boolean(date && date.getTime() < Date.now());
    });
  }

  if (normalized.includes("decision")) {
    return records.filter((record) => record.entity_key === "decision");
  }

  if (normalized.includes("due soon") || normalized.includes("upcoming")) {
    const now = Date.now();
    const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
    return records.filter((record) => {
      if (!isOpen(record)) return false;
      const date = recordDate(record);
      return Boolean(date && date.getTime() >= now && date.getTime() <= sevenDays);
    });
  }

  return records.filter((record) => textMatches(record, normalized));
}

export function AssistantPage({ onOpenEntity, refreshToken }: AssistantPageProps) {
  const [records, setRecords] = useState<QiRecord[]>([]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listAllRecords()
      .then(setRecords)
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [refreshToken]);

  const results = useMemo(
    () => queryRecords(records, submittedQuery).slice(0, 20),
    [records, submittedQuery]
  );

  const openItems = useMemo(() => records.filter(isOpen).length, [records]);
  const waitingItems = useMemo(
    () => records.filter((record) => isOpen(record) && String(record.status || "").toLowerCase() === "waiting").length,
    [records]
  );

  function runQuery(value: string) {
    const next = value.trim();
    setQuery(next);
    setSubmittedQuery(next);
  }

  return (
    <div className="qilife-page qilife-assistant-page">
      <section className="qilife-home-intro">
        <div>
          <div className="qilife-eyebrow">QI ASSISTANT · FOUNDATION</div>
          <h2>Ask your life.</h2>
          <p>Search and orient across the records already inside QiLife.</p>
        </div>
      </section>

      <form
        className="qilife-assistant-search"
        onSubmit={(event) => {
          event.preventDefault();
          runQuery(query);
        }}
      >
        <span>✦</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What needs attention? Who am I waiting on? Find the rental thread..."
          aria-label="Ask QiLife"
          autoFocus
        />
        <button className="qilife-btn primary" type="submit">Search</button>
        {submittedQuery && <button className="qilife-btn quiet" type="button" onClick={() => runQuery("")}>Clear</button>}
      </form>

      <div className="qilife-chip-cloud qilife-assistant-prompts">
        {STARTER_QUERIES.map((starter) => (
          <button key={starter} type="button" onClick={() => runQuery(starter)}>{starter}</button>
        ))}
      </div>

      <section className="qilife-assistant-layout">
        <div className="qilife-panel">
          <div className="qilife-panel-head">
            <div>
              <div className="qilife-eyebrow">RESULTS</div>
              <h3>{submittedQuery ? `Matches for “${submittedQuery}”` : "Recent QiLife records"}</h3>
            </div>
            <span className="qilife-result-count">{results.length}</span>
          </div>

          {loading ? (
            <div className="qilife-empty compact">Loading QiLife memory...</div>
          ) : results.length === 0 ? (
            <div className="qilife-empty compact">No matching records yet.</div>
          ) : (
            <div className="qilife-list">
              {results.map((record) => (
                <button key={record.id} className="qilife-list-row" type="button" onClick={() => onOpenEntity(record.entity_key, record)}>
                  <span>{entityRegistry[record.entity_key]?.icon || "•"}</span>
                  <div>
                    <strong>{record.title}</strong>
                    <small>{entityRegistry[record.entity_key]?.label || record.entity_key}{record.status ? ` · ${record.status}` : ""}</small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="qilife-panel qilife-assistant-status">
          <div><span>Indexed</span><strong>{records.length}</strong></div>
          <div><span>Open</span><strong>{openItems}</strong></div>
          <div><span>Waiting</span><strong>{waitingItems}</strong></div>
          <p>
            Current mode is transparent QiLife retrieval. Email, Calendar, QiVault filesystem,
            QiFinance, semantic search, and approved actions are the next intelligence layer.
          </p>
        </aside>
      </section>
    </div>
  );
}
