// src/features/qilife/components/EntityTable.tsx

import { archiveRecord } from "../services/qilifeStore";
import type { QiEntityDefinition, QiRecord } from "../types";

interface EntityTableProps {
  entity: QiEntityDefinition;
  records: QiRecord[];
  onChanged: () => void;
}

function getCellValue(record: QiRecord, key: string): string {
  if (key === "title")    return record.title;
  if (key === "status")   return record.status   ?? "";
  if (key === "priority") return record.priority  ?? "";
  if (key === "due_date") return record.due_date  ?? "";

  const val = record.data?.[key];
  if (Array.isArray(val))              return val.join(", ");
  if (val === null || val === undefined) return "";
  return String(val);
}

export function EntityTable({ entity, records, onChanged }: EntityTableProps) {
  async function handleArchive(id: string) {
    if (!window.confirm("Archive this record?")) return;
    await archiveRecord(id);
    onChanged();
  }

  return (
    <div className="qi-table-wrap">
      <table className="qi-table">
        <thead>
          <tr>
            {entity.columns.map((col) => (
              <th key={col}>
                {entity.fields.find((f) => f.key === col)?.label ?? col}
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {entity.columns.map((col) => (
                <td key={col}>{getCellValue(record, col)}</td>
              ))}
              <td className="qi-row-actions">
                <button
                  type="button"
                  className="qi-btn-mini"
                  onClick={() => handleArchive(record.id)}
                >
                  Archive
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
