import type {
  QiCreateRecordInput,
  QiRecord,
  QiUpdateRecordInput,
} from "../../features/qilife/types";

export interface JournalEntry {
  id: string;
  title: string;
  entryDate: string;
  bodyMarkdown: string;
  rawCapture?: string | null;
  tags: string[];
  pinned: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalDraft {
  title: string;
  entryDate: string;
  bodyMarkdown: string;
  tags: string[];
  pinned: boolean;
}

export interface JournalRecordStore {
  listRecords(entityKey: string): Promise<QiRecord[]>;
  createRecord(input: QiCreateRecordInput): Promise<QiRecord>;
  updateRecord(id: string, patch: QiUpdateRecordInput): Promise<QiRecord>;
}

export interface JournalRepository {
  list(): Promise<JournalEntry[]>;
  get(id: string): Promise<JournalEntry | null>;
  create(draft: JournalDraft): Promise<JournalEntry>;
  update(id: string, draft: JournalDraft): Promise<JournalEntry>;
}
