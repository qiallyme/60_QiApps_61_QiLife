import { RecordRow } from "./RecordRow";

export interface RecordListItem {
  id: string;
  to?: string;
  entityKey: string;
  title: string;
  metadata?: string;
  status?: string | null;
  priority?: string | null;
  dateLabel?: string | null;
  selected?: boolean;
}

export interface RecordListProps {
  items: readonly RecordListItem[];
  ariaLabel: string;
  emptyMessage?: string;
}

export function RecordList({ items, ariaLabel, emptyMessage = "Nothing here yet." }: RecordListProps) {
  return (
    <ul className="qilife-record-list" aria-label={ariaLabel}>
      {items.length === 0 ? (
        <li className="qilife-empty compact">{emptyMessage}</li>
      ) : (
        items.map((item) => (
          <li key={item.id}>
            <RecordRow
              entityKey={item.entityKey}
              title={item.title}
              metadata={item.metadata}
              status={item.status}
              priority={item.priority}
              dateLabel={item.dateLabel}
              selected={item.selected}
              to={item.to}
            />
          </li>
        ))
      )}
    </ul>
  );
}
