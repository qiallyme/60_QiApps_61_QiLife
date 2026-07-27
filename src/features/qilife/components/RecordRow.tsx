import { ChevronRight, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { RecordIcon } from "./RecordIcon";

export interface RecordRowProps {
  to?: string;
  entityKey: string;
  title: string;
  metadata?: string;
  status?: string | null;
  priority?: string | null;
  dateLabel?: string | null;
  selected?: boolean;
}

export function RecordRow({
  to,
  entityKey,
  title,
  metadata,
  status,
  priority,
  dateLabel,
  selected = false,
}: RecordRowProps) {
  const content = (
    <>
      <div className="qilife-record-row-leading">
        <RecordIcon entityKey={entityKey} />
      </div>
      <div className="qilife-record-row-body">
        <div className="qilife-record-row-title">{title}</div>
        <div className="qilife-record-row-meta">
          {metadata && <span>{metadata}</span>}
          {status && <span>{status}</span>}
          {priority && <span>{priority}</span>}
          {dateLabel && <span>{dateLabel}</span>}
        </div>
      </div>
      <div className="qilife-record-row-trailing">
        {selected ? <GripVertical aria-hidden="true" size={16} /> : <ChevronRight aria-hidden="true" size={16} />}
      </div>
    </>
  );

  const className = `qilife-record-row${selected ? " selected" : ""}`;

  if (to) {
    return (
      <Link className={className} to={to} aria-label={title}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} aria-label={title}>
      {content}
    </div>
  );
}
