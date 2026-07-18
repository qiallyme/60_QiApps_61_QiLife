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

function recordSearchText(record: QiRecord): string {
  return [
    record.title,
    record.entity_key,
    record.status,
    record.priority,
    record.due_date,
    JSON.stringify(record.data)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesQuery(record: QiRecord, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 1);
  if (terms.length === 0) return true;
  const haystack = recordSearchText(record);
  return terms.every((term) => haystack.includes(term));
}

function isOpen(record: QiRecord): boolean {
  return !["done", "completed", "cancelled", "resolved", "closed", "archived"].includes(
    String(record.status || "").toLowerCase()
  );
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
      .catch((error) => console.warn(error))
      .finally(() => setLoading(false));
  }, [refreshToken]);

  const results = useMemo(() => {
    const source = submittedQuery
      ? records.filter((record) => matchesQuery(record, submittedQuery))
      : records;
    return source.slice(0, 20);
  }, [records, submittedQuery]);

  const openItems = useMemo(() => records.filter(isOpen).length, [records]);
  const waitingItems = useMemo(
    () => records.filter((record) => String(record.status || "").toLowerCase() === "waiting").length,
    [records]
  );

  function runQuery(value: string) {
    const next = value.trim();
    setQuery(next);
    setSubmittedQuery(next);
  }

  return (
    <div className="qilife-page">
      <section className="qilife-hero">
        <div className="qilife-eyebrow">QI ASSISTANT · FOUNDATION</div>
        <h2>Ask your life, not another empty chatbot.</h2>
        <p>
          This first pass searches the records already inside QiLife. QiVault, email, calendar,
          QiFinance, and other connectors can feed this same workspace next.
        </p>

        <form
          className="qilife-actions wrap"
          style={{ justifyContent: "flex-start", marginTop: 16 }}
          onSubmit={(event) => {
            event.preventDefault();
            runQuery(query);
          }}
        >
          <input
            className="qilife-search"
            style={{ flex: "1 1 360px" }}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks, threads, people, events, decisions, and notes..."
            aria-label="Ask QiLife"
          />
          <button className="qilife-btn primary" type="submit">Search QiLife</button>
          {submittedQuery && (
            <button className="qilife-btn" type="button" onClick={() => runQuery("")}>Clear</button>
          )}
        </form>
      </section>

      <section className="qilife-stat-grid">
        <div className="qilife-stat-card"><span>Indexed records</span><strong>{records.length}</strong></div>
        <div className="qilife-stat-card"><span>Open items</span><strong>{openItems}</strong></div>
        <div className="qilife-stat-card"><span>Waiting</span><strong>{waitingItems}</strong></div>
        <div className="qilife-stat-card"><span>Matches</span><strong>{results.length}</strong></div>
      </section>

      <section className="qilife-split-section">
        <div className="qilife-panel">
          <div className="qilife-panel-head">
            <div>
              <div className="qilife-eyebrow">RESULTS</div>
              <h3>{submittedQuery ? `Matches for “${submittedQuery}”` : "Recent QiLife records"}</h3>
            </div>
          </div>

          {loading ? (
            <div className="qilife-empty compact">Loading QiLife memory...</div>
          ) : results.length === 0 ? (
            <div className="qilife-empty compact">No matching records yet.</div>
          ) : (
            <div className="qilife-list">
              {results.map((record) => (
                <button
                  key={record.id}
                  className="qilife-list-row"
                  type="button"
                  onClick={() => onOpenEntity(record.entity_key, record)}
                >
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
          )}
        </div>

        <div className="qilife-panel">
          <div className="qilife-panel-head">
            <div>
              <div className="qilife-eyebrow">START HERE</div>
              <h3>Useful questions</h3>
            </div>
          </div>
          <div className="qilife-chip-cloud">
            {STARTER_QUERIES.map((starter) => (
              <button key={starter} type="button" onClick={() => runQuery(starter)}>
                {starter}
              </button>
            ))}
          </div>
          <p style={{ color: "var(--qi-muted)", lineHeight: 1.55, marginTop: 16 }}>
            Current mode is transparent local retrieval—not pretend AI. The next intelligence layer
            should add semantic search, connector citations, suggested actions, and an approval queue.
          </p>
        </div>
      </section>
    </div>
  );
}
