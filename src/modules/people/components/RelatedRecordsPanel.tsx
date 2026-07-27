import { RecordList } from "../../../features/qilife/components/RecordList";
import type { RelatedRecordReference } from "../types";

interface RelatedRecordsPanelProps {
  records: RelatedRecordReference[];
}

export const RelatedRecordsPanel = ({ records }: RelatedRecordsPanelProps) => {
  return (
    <div className="qilife-card people-related-records">
      <div className="people-panel-header">
        <h4>Related QiLife Records</h4>
        <span>{records.length} linked</span>
      </div>

      {records.length === 0 ? (
        <div className="qilife-empty compact">No cross-module records linked yet.</div>
      ) : (
        <RecordList
          ariaLabel="Related QiLife Records"
          items={records.map((record) => ({
            id: record.id,
            entityKey: record.entityType,
            title: record.title,
            metadata: [record.relationshipType.replace(/_/g, " "), record.summary ?? ""].filter(Boolean).join(" · "),
            dateLabel: new Date(record.timestamp).toLocaleDateString(),
            to: record.targetRoute,
          }))}
        />
      )}
    </div>
  );
};
