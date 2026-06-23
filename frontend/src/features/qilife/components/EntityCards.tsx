// src/features/qilife/components/EntityCards.tsx

import type { QiEntityDefinition, QiRecord } from "../types";

interface EntityCardsProps {
  entity: QiEntityDefinition;
  records: QiRecord[];
  onChanged: () => void;
}

function getSubtitle(record: QiRecord, entity: QiEntityDefinition): string {
  return entity.columns
    .filter((col) => col !== entity.titleField)
    .slice(0, 3)
    .map((col) => {
      if (col === "status")   return record.status;
      if (col === "priority") return record.priority;
      if (col === "due_date") return record.due_date;
      return record.data?.[col];
    })
    .filter(Boolean)
    .map(String)
    .join(" · ");
}

export function EntityCards({ entity, records }: EntityCardsProps) {
  return (
    <div className="qi-card-grid">
      {records.map((record) => (
        <article key={record.id} className="qi-card">
          <div className="qi-card-title">{record.title}</div>
          <div className="qi-card-desc">{getSubtitle(record, entity)}</div>
          <div className="qi-card-meta">{entity.label}</div>
        </article>
      ))}
    </div>
  );
}
