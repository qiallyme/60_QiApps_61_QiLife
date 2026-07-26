import { useEffect, useMemo, useState } from "react";
import { listRecords } from "../services/qilifeStore";
import type { QiRecord } from "../types";

interface RelationSelectorProps {
  relationEntity: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loadRecords?: (entityKey: string) => Promise<QiRecord[]>;
  id?: string;
  name?: string;
}

function relationLabel(entity: string) {
  return entity === "person"
    ? "People"
    : `${entity[0]?.toUpperCase() ?? ""}${entity.slice(1)}s`;
}

export function RelationSelector({
  relationEntity,
  value,
  onChange,
  disabled = false,
  loadRecords = listRecords,
  id,
  name,
}: RelationSelectorProps) {
  const [records, setRecords] = useState<QiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    loadRecords(relationEntity)
      .then((rows) => {
        if (active) setRecords(rows.filter((record) => !record.archived_at));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [loadRecords, relationEntity]);

  const resolved = useMemo(
    () => records.some((record) => record.id === value),
    [records, value],
  );
  const label = relationLabel(relationEntity);

  return (
    <>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled || loading}
        aria-busy={loading}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{loading ? `Loading ${label}…` : `No ${relationEntity}`}</option>
        {value && !resolved && <option value={value}>{value} (legacy value)</option>}
        {records.map((record) => <option key={record.id} value={record.id}>{record.title}</option>)}
      </select>
      {error && <span className="qilife-field-error" role="alert">Unable to load {label}. The current value is preserved.</span>}
    </>
  );
}

interface MultiRelationSelectorProps {
  relationEntity: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  loadRecords?: (entityKey: string) => Promise<QiRecord[]>;
  id?: string;
  name?: string;
}

export function MultiRelationSelector({
  relationEntity,
  values,
  onChange,
  disabled = false,
  loadRecords = listRecords,
  id,
  name,
}: MultiRelationSelectorProps) {
  const [records, setRecords] = useState<QiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    loadRecords(relationEntity)
      .then((rows) => {
        if (active) setRecords(rows.filter((record) => !record.archived_at));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [loadRecords, relationEntity]);

  const byId = new Map(records.map((record) => [record.id, record]));
  const available = records.filter((record) => !values.includes(record.id));
  const label = relationLabel(relationEntity);

  return (
    <div className="qilife-multi-relation">
      {values.length > 0 && (
        <div className="qilife-relation-chips" aria-label={`Selected ${label}`}>
          {values.map((value) => {
            const record = byId.get(value);
            const display = record?.title ?? `${value} (legacy value)`;
            return (
              <span className="qilife-relation-chip" key={value}>
                <span>{display}</span>
                <button
                  type="button"
                  aria-label={`Remove ${record?.title ?? value}`}
                  disabled={disabled}
                  onClick={() => onChange(values.filter((item) => item !== value))}
                >×</button>
              </span>
            );
          })}
        </div>
      )}
      <select
        id={id}
        name={name}
        value=""
        disabled={disabled || loading}
        aria-busy={loading}
        onChange={(event) => {
          if (event.target.value) onChange([...values, event.target.value]);
        }}
      >
        <option value="">{loading ? `Loading ${label}…` : `Add ${relationEntity}`}</option>
        {available.map((record) => <option key={record.id} value={record.id}>{record.title}</option>)}
      </select>
      {error && <span className="qilife-field-error" role="alert">Unable to load {label}. Existing selections are preserved.</span>}
    </div>
  );
}
