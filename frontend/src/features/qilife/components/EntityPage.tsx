// src/features/qilife/components/EntityPage.tsx

import { useEffect, useState } from "react";
import { createRecord, listRecords } from "../services/qilifeStore";
import type { QiEntityDefinition, QiLayout, QiRecord } from "../types";
import { EntityCards } from "./EntityCards";
import { EntityTable } from "./EntityTable";

interface EntityPageProps {
  entity: QiEntityDefinition;
  onCapture: () => void;
}

export function EntityPage({ entity, onCapture }: EntityPageProps) {
  const [records, setRecords] = useState<QiRecord[]>([]);
  const [layout, setLayout]   = useState<QiLayout>(entity.defaultLayout);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Reset layout when switching entities
  useEffect(() => {
    setLayout(entity.defaultLayout);
  }, [entity.key, entity.defaultLayout]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const rows = await listRecords(entity.key);
      setRecords(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [entity.key]);

  async function handleCreate() {
    const raw = window.prompt(`New ${entity.label} — enter a title:`);
    const title = raw?.trim();
    if (!title) return;

    try {
      const defaultStatus =
        entity.fields.find((f) => f.key === "status")?.options?.[0] ?? null;
      await createRecord({
        entity_key: entity.key,
        title,
        status: defaultStatus,
        data: { [entity.titleField]: title },
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed.");
    }
  }

  return (
    <div className="qi-page">
      <div className="qi-page-header">
        <div>
          <div className="qi-eyebrow">{entity.section}</div>
          <h2>{entity.plural}</h2>
          <p>{loading ? "Loading…" : `${records.length} record${records.length !== 1 ? "s" : ""}`}</p>
        </div>

        <div className="qi-actions">
          {/* Layout toggle */}
          <div className="qi-layout-toggle">
            <button
              type="button"
              className={layout === "table" ? "active" : ""}
              onClick={() => setLayout("table")}
            >
              Table
            </button>
            <button
              type="button"
              className={layout === "cards" ? "active" : ""}
              onClick={() => setLayout("cards")}
            >
              Cards
            </button>
          </div>

          <button type="button" className="qi-btn" onClick={onCapture}>
            + Capture
          </button>
          <button type="button" className="qi-btn primary" onClick={handleCreate}>
            + New {entity.label}
          </button>
        </div>
      </div>

      {error && <div className="qi-error">{error}</div>}

      {!loading && !error && records.length === 0 && (
        <div className="qi-empty">
          No {entity.plural.toLowerCase()} yet.
        </div>
      )}

      {!loading && !error && records.length > 0 && layout === "table" && (
        <EntityTable entity={entity} records={records} onChanged={load} />
      )}

      {!loading && !error && records.length > 0 && layout !== "table" && (
        <EntityCards entity={entity} records={records} onChanged={load} />
      )}
    </div>
  );
}
