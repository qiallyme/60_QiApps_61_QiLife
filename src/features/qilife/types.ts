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
  | "checkbox"
  | "url";

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
  placeholder?: string;
}

export interface QiEntityDefinition {
  key: string;
  label: string;
  plural: string;
  icon?: string;
  section: string;
  description: string;
  defaultLayout: QiLayout;
  titleField: string;
  statusField?: string;
  priorityField?: string;
  dueDateField?: string;
  fields: QiField[];
  columns: string[];
}

export interface QiRecord {
  id: string;
  owner_id?: string;
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

export interface QiUpdateRecordInput {
  title?: string;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// QiLife 2.0 Core Universal Primitives (ADRs 0005 - 0009)
// ---------------------------------------------------------------------------

export type QiBitType =
  | "capture"
  | "thought"
  | "note"
  | "task"
  | "project"
  | "person"
  | "journal"
  | "document"
  | "event"
  | "decision"
  | "idea"
  | "problem"
  | "conversation"
  | "source"
  | "memory"
  | "notebook"
  | "podcast"
  | "output"
  | "workflow"
  | "expense";

export type MemoryState = "transient" | "promoted" | "archived" | "superseded";

export interface BitProvenance {
  creator: "user" | "agent" | "ingest";
  sourceSystem?: string;
  originatingQiBitIds?: string[];
  confidence?: number;
  reasoning?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Universal QiBit Envelope (ADR 0005)
 */
export interface QiBit {
  id: string;
  owner_id?: string;
  qiDecimal?: string; // Permanent QiDecimal address e.g. "10.20.100"
  type: QiBitType;
  title: string;
  body?: string;
  metadata: Record<string, unknown>;
  provenance: BitProvenance;
  memoryState: MemoryState;
  source?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  embedding?: number[];
}

/**
 * Universal Bi-Directional Entity Link (ADR 0008)
 */
export interface EntityLink {
  id: string;
  ownerId?: string;
  sourceEntityType: string;
  sourceId: string;
  targetEntityType: string;
  targetId: string;
  relationshipType:
    | "related_to"
    | "belongs_to"
    | "contains"
    | "references"
    | "concerns"
    | "depends_on"
    | "blocked_by"
    | "caused_by"
    | "assigned_to"
    | "waiting_on"
    | "derived_from"
    | "supersedes"
    | "contradicts"
    | "supports"
    | "cost_center"
    | "reimbursement"
    | "evidences";
  createdAt: string;
}

/**
 * Operational Open Loop (ADR 0006)
 */
export interface OpenLoop {
  id: string;
  ownerId?: string;
  bitId?: string;
  summary: string;
  loopType: "action" | "waiting" | "decision" | "blocker" | "followup";
  status: "open" | "resolved" | "dismissed";
  confidence: number;
  dueDate?: string | null;
  createdAt: string;
}

/**
 * Action Model 2.0 (ADR 0003)
 */
export interface CandidateAction {
  id: string;
  title: string;
  description?: string;
  status: "candidate" | "authorized" | "executing" | "completed" | "rejected";
  consequential: boolean;
  originatingQiBitIds: string[];
  proposedParameters?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Operational Briefing State (ADR 0006 / QiLife 2.0 Home)
 */
export interface OperationalBriefing {
  whatChanged: QiBit[];
  whatNeedsAttention: OpenLoop[];
  whatIsWaiting: OpenLoop[];
  whatIsBlocked: OpenLoop[];
  whatMayBeForgotten: QiBit[];
  recommendedNextActions: CandidateAction[];
}
