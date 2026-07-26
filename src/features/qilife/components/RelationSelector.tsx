import { useEffect, useMemo, useState } from "react";
import { listRecords } from "../services/qilifeStore";
import type { QiRecord } from "../types";

interface RelationSelectorProps {
  relationEntity: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loadRecords?: (entityKey: string) => Promise<QiRecord[]>;
}

export function RelationSelector({
  relationEntity,
  value,
  onChange,
  disabled = false,
  loadRecords = listRecords,
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

  const resolved = useMemo(() => records.some((record) => record.id === value), [records, value]);
  const label = relationEntity === "person" ? "People" : `${relationEntity[0]?.toUpperCase() ?? ""}${relationEntity.slice(1)}s`;

  return (
    <>
      <select
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
