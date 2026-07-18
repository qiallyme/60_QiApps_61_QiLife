import { useEffect, useMemo, useState } from "react";
import type { QiEntityDefinition, QiLayout, QiRecord } from "../types";
import { archiveRecord, createRecord, listRecords, updateRecord } from "../services/qilifeStore";
import { EntityCards } from "./EntityCards";
import { EntityFormModal } from "./EntityFormModal";
import { EntityTable } from "./EntityTable";
import { mapFormValuesToRecord } from "../utils/recordValues";

interface EntityPageProps {
  entity: QiEntityDefinition;
  refreshToken: number;
  autoEditRecord?: QiRecord | null;
  onClearAutoEdit?: () => void;
  embedded?: boolean;
}

export function EntityPage({
  entity,
  refreshToken,
  autoEditRecord,
  onClearAutoEdit,
  embedded = false
}: EntityPageProps) {
  const [records, setRecords] = useState<QiRecord[]>([]);
  const [layout, setLayout] = useState<QiLayout>(entity.defaultLayout);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<{ mode: "create" | "edit"; record?: QiRecord } | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const rows = await listRecords(entity.key);
      setRecords(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoEditRecord && autoEditRecord.entity_key === entity.key) {
      setModalState({ mode: "edit", record: autoEditRecord });
      onClearAutoEdit?.();
    }
  }, [entity.key, autoEditRecord, onClearAutoEdit]);

  useEffect(() => {
    setLayout(entity.defaultLayout);
    setSearch("");
  }, [entity.key, entity.defaultLayout]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.key, refreshToken]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((record) => JSON.stringify(record).toLowerCase().includes(q));
  }, [records, search]);

  async function handleFormSubmit(values: Record<string, unknown>, record?: QiRecord) {
    const mapped = mapFormValuesToRecord(entity, values);
    if (record) await updateRecord(record.id, mapped);
    else await createRecord({ entity_key: entity.key, ...mapped });
    setModalState(null);
    await load();
  }

  async function handleArchive(record: QiRecord, skipConfirm = false) {
    if (!skipConfirm && !window.confirm(`Archive "${record.title}"?`)) return;
    await archiveRecord(record.id);
    setModalState(null);
    await load();
  }

  return (
    <div className={embedded ? "qilife-entity-embedded" : "qilife-page"}>
      <div className={embedded ? "qilife-entity-toolbar" : "qilife-page-header"}>
        <div>
          {!embedded && <div className="qilife-eyebrow">{entity.section}</div>}
          <h2 className={embedded ? "qilife-entity-title" : ""}>
            {!embedded && <span className="qilife-title-icon">{entity.icon}</span>}
            {entity.plural}
          </h2>
          <p>{entity.description}</p>
        </div>

        <div className="qilife-actions wrap">
          <input
            className="qilife-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${entity.plural.toLowerCase()}...`}
          />
          <button className="qilife-btn quiet" type="button" onClick={() => setLayout(layout === "table" ? "cards" : "table")}>
            {layout === "table" ? "Cards" : "Table"}
          </button>
          <button className="qilife-btn primary" type="button" onClick={() => setModalState({ mode: "create" })}>
            + New
          </button>
        </div>
      </div>

      <div className="qilife-subbar">
        <span>{filteredRecords.length} shown</span>
        {search && <span>{records.length} total</span>}
      </div>

      {loading && <div className="qilife-empty">Loading...</div>}
      {error && <div className="qilife-error">{error}</div>}

      {!loading && !error && filteredRecords.length === 0 && (
        <div className="qilife-empty">No {entity.plural.toLowerCase()} yet.</div>
      )}

      {!loading && !error && filteredRecords.length > 0 && layout === "table" && (
        <EntityTable
          entity={entity}
          records={filteredRecords}
          onEdit={(record) => setModalState({ mode: "edit", record })}
          onArchive={handleArchive}
        />
      )}

      {!loading && !error && filteredRecords.length > 0 && layout !== "table" && (
        <EntityCards
          entity={entity}
          records={filteredRecords}
          onEdit={(record) => setModalState({ mode: "edit", record })}
          onArchive={handleArchive}
        />
      )}

      {modalState && (
        <EntityFormModal
          entity={entity}
          record={modalState.record}
          mode={modalState.mode}
          onClose={() => setModalState(null)}
          onSubmit={handleFormSubmit}
          onArchive={(record) => handleArchive(record, true)}
        />
      )}
    </div>
  );
}
