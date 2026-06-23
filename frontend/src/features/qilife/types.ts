// src/features/qilife/types.ts

export type QiFieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "enum"
  | "tags"
  | "relation"
  | "checkbox";

export type QiLayout = "table" | "cards" | "kanban";

export interface QiField {
  key: string;
  label: string;
  type: QiFieldType;
  primary?: boolean;
  required?: boolean;
  options?: string[];
  relationEntity?: string;
  locked?: boolean;
}

export interface QiEntityDefinition {
  key: string;
  label: string;
  plural: string;
  icon?: string;
  section: string;
  defaultLayout: QiLayout;
  titleField: string;
  statusField?: string;
  fields: QiField[];
  columns: string[];
}

export interface QiRecord {
  id: string;
  entity_key: string;
  title: string;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  data: Record<string, unknown>;
  source?: string;
  created_at?: string;
  updated_at?: string;
  archived_at?: string | null;
}

export interface QiCreateRecordInput {
  entity_key: string;
  title: string;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  data?: Record<string, unknown>;
}
