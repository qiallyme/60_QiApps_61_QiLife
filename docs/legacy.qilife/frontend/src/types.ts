export type Bucket = {
  code: string;
  name: string;
  slug: string;
  folder_path: string;
  sort_order: number;
  description: string;
  is_system: boolean;
};

export type Qibit = {
  id: string;
  title: string;
  raw_capture: string;
  summary: string;
  meaning: string;
  qibit_type: string;
  bucket_code: string;
  thread_id: string | null;
  status: string;
  priority: string;
  importance: string;
  future_slot: string;
  action_required: boolean;
  suggested_action: string | null;
  captured_at: string;
  happened_at: string | null;
  tags_json: string[];
};

export type Thread = {
  id: string;
  title: string;
  description: string;
  bucket_code: string;
  status: string;
  priority: string;
  next_action: string | null;
  due_date: string | null;
  started_at: string;
  closed_at: string | null;
  tags_json: string[];
  created_at?: string;
  updated_at?: string;
};

export type QiBitType = "care" | "finance" | "legal" | "tech" | "task" | "note";
export type Priority = "low" | "medium" | "high";
export type ActionStatus = "open" | "done";
export type AgentConfidence = "low" | "medium" | "high";

export type Action = {
  id: string;
  qibitId: string | null;
  createdAt: string;
  title: string;
  status: ActionStatus;
  priority: Priority;
  dueHint?: string;
  sourceText?: string;
  qibitTitle?: string;

  // Legacy/API compatibility fields
  description?: string;
  bucket_code?: string;
  thread_id?: string | null;
  energy?: string;
  context?: string;
  scheduled_for?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  resolution_note?: string | null;
  tags_json?: string[];
  source_qibit_id?: string | null;
};

export type AgentDraft = {
  suggestedType: QiBitType;
  suggestedTitle: string;
  suggestedSummary: string;
  suggestedTags: string[];
  suggestedPriority: Priority;
  suggestedSpace: string;
  detectedSignals: string[];
  confidence: AgentConfidence;
  insight: string;
  actions: Action[];
  extractedActions?: Action[];
};

export type QiBit = {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: QiBitType;
  title: string;
  summary: string;
  rawText: string;
  tags: string[];
  priority: Priority;
  status: string;
  space: string;
  agentDraft: AgentDraft;
  insight: string;
  source: string;
  bucket_code?: string;
  thread_id?: string | null;
  action_required?: boolean;
  suggested_action?: string | null;
  future_slot?: string | null;
  peopleIds?: string[];
  linkedPeople?: Person[];
  linkedActions?: Action[];
};

export type Draft = {
  id: string;
  createdAt: string;
  updatedAt: string;
  rawText: string;
  source: string;
  status: "draft";
  agentDraft: AgentDraft;
};

export type ActionStep = {
  id: string;
  action_id: string;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
  completed_at: string | null;
};

export type Person = {
  id: string;
  display_name: string;
  legal_name: string;
  relationship: string;
  type: string;
  email: string | null;
  phone: string | null;
  address?: string | null;
  notes: string | null;
  tags_json?: string[];
  created_at?: string;
  updated_at?: string;
};

export type TimelineActionLink = Pick<Action, "id" | "title" | "status" | "priority" | "dueHint">;

export type TimelinePayload = {
  qibitId?: string;
  rawText?: string;
  summary?: string;
  type?: QiBitType;
  priority?: Priority;
  tags?: string[];
  space?: string;
  createdAt?: string;
  updatedAt?: string;
  thread_id?: string | null;
  future_slot?: string | null;
  peopleIds?: string[];
  linkedPeople?: Array<Pick<Person, "id" | "display_name" | "relationship" | "type">>;
  linkedActionIds?: string[];
  linkedActions?: TimelineActionLink[];
  insight?: string;
  source?: string;
  agentDraft?: AgentDraft;
  [key: string]: unknown;
};

export type TimelineRow = {
  id: string;
  record_type: string;
  title: string;
  timestamp: string;
  bucket_code: string;
  payload: TimelinePayload;
};

export type ReviewSaveResponse = {
  qibit: QiBit;
  actions: Action[];
  timelineItem: TimelineRow;
};

export type KnowledgeDoc = {
  id: string;
  title: string;
  relativePath: string;
  group: string;
  content?: string;
  excerpt?: string;
};

export type KnowledgeCategory = {
  id: string;
  title: string;
  count: number;
  docs: KnowledgeDoc[];
};
