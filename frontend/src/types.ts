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
};

export type Thread = {
  id: string;
  title: string;
  description: string;
  bucket_code: string;
  status: string;
  priority: string;
  next_action: string | null;
};

export type Action = {
  id: string;
  title: string;
  description: string;
  bucket_code: string;
  thread_id: string | null;
  status: string;
  priority: string;
  scheduled_for: string | null;
  completed_at: string | null;
};

export type Person = {
  id: string;
  display_name: string;
  legal_name: string;
  relationship: string;
  type: string;
};

export type TimelineRow = {
  id: string;
  record_type: string;
  title: string;
  timestamp: string;
  bucket_code: string;
  payload: Record<string, unknown>;
};
