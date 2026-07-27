import { CircleDot, FileText, FolderKanban, NotebookPen, UserRound } from "lucide-react";

const ICONS = {
  task: CircleDot,
  project: FolderKanban,
  person: UserRound,
  journal_entry: NotebookPen,
};

export function RecordIcon({ entityKey }: { entityKey: string }) {
  const Icon = ICONS[entityKey as keyof typeof ICONS] ?? FileText;
  return <Icon aria-hidden="true" className="qilife-record-icon" strokeWidth={1.8} />;
}
