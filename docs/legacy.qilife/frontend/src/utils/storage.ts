import {
  Action,
  AgentDraft,
  Bucket,
  Draft,
  Person,
  Priority,
  QiBit,
  QiBitType,
  Thread,
  TimelineActionLink,
  TimelinePayload,
  TimelineRow,
} from "../types";

export const PENDING_DRAFT_KEY = "qilife_pending_draft";
export const QIBITS_KEY = "qilife_qibits";
export const TIMELINE_KEY = "qilife_timeline";
export const ACTIONS_KEY = "qilife_actions";
export const THREADS_KEY = "qilife_threads";
export const PEOPLE_KEY = "qilife_people";

const ISO_NOW = () => new Date().toISOString();

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function coerceIso(value: unknown, fallback = ISO_NOW()): string {
  if (typeof value !== "string") return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const cleaned = value.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

function normalizePriority(value: unknown): Priority {
  const raw = typeof value === "string" ? value.toLowerCase() : "";
  if (raw === "high") return "high";
  if (raw === "medium") return "medium";
  return "low";
}

function normalizeType(value: unknown): QiBitType {
  const raw = typeof value === "string" ? value.toLowerCase() : "";
  if (raw === "care") return "care";
  if (raw === "finance" || raw === "transactions") return "finance";
  if (raw === "legal" || raw === "events") return "legal";
  if (raw === "tech") return "tech";
  if (raw === "task" || raw === "actions") return "task";
  return "note";
}

function normalizeSpace(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "General";

  const raw = value.trim();
  const lower = raw.toLowerCase();
  if (lower === "mom's care" || lower === "moms care") return "Moms Care";
  if (lower === "legal / life") return "Legal";
  if (lower === "projects") return "Tech";
  if (lower === "finance") return "Finance";
  if (lower === "inbox") return "Inbox";
  if (lower === "general") return "General";
  return raw;
}

function normalizeAction(raw: Record<string, unknown>, rawTextFallback = "", qibitIdFallback: string | null = null): Action {
  const createdAt = coerceIso(raw.createdAt ?? raw.created_at);
  const sourceText =
    typeof raw.sourceText === "string"
      ? raw.sourceText
      : typeof raw.description === "string"
        ? raw.description
        : rawTextFallback || undefined;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `action-${Math.random().toString(36).slice(2, 10)}`,
    qibitId:
      typeof raw.qibitId === "string"
        ? raw.qibitId
        : typeof raw.source_qibit_id === "string"
          ? raw.source_qibit_id
          : qibitIdFallback,
    createdAt,
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim()
        : typeof raw.suggested_action === "string" && raw.suggested_action.trim()
          ? raw.suggested_action.trim()
          : "Untitled action",
    status:
      String(raw.status ?? "").toLowerCase() === "done" || String(raw.status ?? "").toLowerCase() === "completed"
        ? "done"
        : "open",
    priority: normalizePriority(raw.priority),
    dueHint:
      typeof raw.dueHint === "string"
        ? raw.dueHint
        : typeof raw.due_date === "string"
          ? raw.due_date
          : typeof raw.scheduled_for === "string"
            ? raw.scheduled_for
            : undefined,
    sourceText,
    qibitTitle: typeof raw.qibitTitle === "string" ? raw.qibitTitle : undefined,
    description: typeof raw.description === "string" ? raw.description : undefined,
    bucket_code: typeof raw.bucket_code === "string" ? raw.bucket_code : undefined,
    thread_id: typeof raw.thread_id === "string" ? raw.thread_id : null,
    energy: typeof raw.energy === "string" ? raw.energy : undefined,
    context: typeof raw.context === "string" ? raw.context : undefined,
    scheduled_for: typeof raw.scheduled_for === "string" ? raw.scheduled_for : null,
    due_date: typeof raw.due_date === "string" ? raw.due_date : null,
    completed_at: typeof raw.completed_at === "string" ? raw.completed_at : null,
    resolution_note: typeof raw.resolution_note === "string" ? raw.resolution_note : null,
    tags_json: Array.isArray(raw.tags_json) ? uniqueStrings(raw.tags_json) : undefined,
    source_qibit_id: typeof raw.source_qibit_id === "string" ? raw.source_qibit_id : qibitIdFallback,
  };
}

function normalizeThread(raw: Record<string, unknown>): Thread {
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `thread-${Math.random().toString(36).slice(2, 10)}`,
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "Untitled thread",
    description: typeof raw.description === "string" ? raw.description : "",
    bucket_code:
      typeof raw.bucket_code === "string" && raw.bucket_code
        ? raw.bucket_code
        : typeof raw.space === "string" && raw.space
          ? raw.space
          : "inbox",
    status: typeof raw.status === "string" && raw.status ? raw.status : "open",
    priority: typeof raw.priority === "string" && raw.priority ? raw.priority : "normal",
    next_action: typeof raw.next_action === "string" ? raw.next_action : null,
    due_date: typeof raw.due_date === "string" ? raw.due_date : null,
    started_at: coerceIso(raw.started_at ?? raw.created_at),
    closed_at: typeof raw.closed_at === "string" ? raw.closed_at : null,
    tags_json: Array.isArray(raw.tags_json) ? uniqueStrings(raw.tags_json) : [],
    created_at: coerceIso(raw.created_at ?? raw.started_at),
    updated_at: coerceIso(raw.updated_at ?? raw.created_at ?? raw.started_at),
  };
}

function normalizePerson(raw: Record<string, unknown>): Person {
  const displayName =
    typeof raw.display_name === "string" && raw.display_name.trim()
      ? raw.display_name.trim()
      : typeof raw.legal_name === "string" && raw.legal_name.trim()
        ? raw.legal_name.trim()
        : "Unnamed person";

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `person-${Math.random().toString(36).slice(2, 10)}`,
    display_name: displayName,
    legal_name:
      typeof raw.legal_name === "string" && raw.legal_name.trim()
        ? raw.legal_name.trim()
        : displayName,
    relationship: typeof raw.relationship === "string" ? raw.relationship : "",
    type: typeof raw.type === "string" && raw.type ? raw.type : "person",
    email: typeof raw.email === "string" ? raw.email : null,
    phone: typeof raw.phone === "string" ? raw.phone : null,
    address: typeof raw.address === "string" ? raw.address : null,
    notes: typeof raw.notes === "string" ? raw.notes : null,
    tags_json: Array.isArray(raw.tags_json) ? uniqueStrings(raw.tags_json) : [],
    created_at: coerceIso(raw.created_at),
    updated_at: coerceIso(raw.updated_at ?? raw.created_at),
  };
}

function normalizeLinkedPeople(raw: unknown): Person[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((person) => normalizePerson((person ?? {}) as Record<string, unknown>));
}

function normalizeAgentDraft(raw: Record<string, unknown>, rawText: string): AgentDraft {
  const actionSeed = Array.isArray(raw.actions)
    ? raw.actions
    : Array.isArray(raw.extractedActions)
      ? raw.extractedActions
      : [];

  const actions = actionSeed.map((action) => normalizeAction((action ?? {}) as Record<string, unknown>, rawText));

  return {
    suggestedType: normalizeType(raw.suggestedType ?? raw.qibit_type),
    suggestedTitle:
      typeof raw.suggestedTitle === "string" && raw.suggestedTitle.trim()
        ? raw.suggestedTitle.trim()
        : "Untitled capture",
    suggestedSummary:
      typeof raw.suggestedSummary === "string" && raw.suggestedSummary.trim()
        ? raw.suggestedSummary.trim()
        : rawText,
    suggestedTags: uniqueStrings(
      Array.isArray(raw.suggestedTags)
        ? raw.suggestedTags
        : Array.isArray(raw.tags)
          ? raw.tags
          : Array.isArray(raw.tags_json)
            ? raw.tags_json
            : [],
    ),
    suggestedPriority: normalizePriority(raw.suggestedPriority ?? raw.priority),
    suggestedSpace: normalizeSpace(raw.suggestedSpace ?? raw.space ?? raw.bucket_code),
    detectedSignals: uniqueStrings(Array.isArray(raw.detectedSignals) ? raw.detectedSignals : []),
    confidence:
      raw.confidence === "high" || raw.confidence === "medium" || raw.confidence === "low"
        ? raw.confidence
        : "medium",
    insight: typeof raw.insight === "string" && raw.insight.trim() ? raw.insight.trim() : "No draft insight available.",
    actions,
    extractedActions: actions,
  };
}

function normalizeDraft(raw: Record<string, unknown>): Draft {
  const rawText =
    typeof raw.rawText === "string"
      ? raw.rawText
      : typeof raw.raw_capture === "string"
        ? raw.raw_capture
        : "";

  const agentDraft = raw.agentDraft
    ? normalizeAgentDraft(raw.agentDraft as Record<string, unknown>, rawText)
    : normalizeAgentDraft(raw, rawText);

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `draft-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: coerceIso(raw.createdAt ?? raw.created_at),
    updatedAt: coerceIso(raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at),
    rawText,
    source:
      typeof raw.source === "string"
        ? raw.source
        : typeof raw.sourceType === "string"
          ? raw.sourceType
          : "capture",
    status: "draft",
    agentDraft,
  };
}

function normalizeQiBit(raw: Record<string, unknown>): QiBit {
  const payload = (raw.payload ?? {}) as TimelinePayload;
  const rawText =
    typeof raw.rawText === "string"
      ? raw.rawText
      : typeof raw.raw_capture === "string"
        ? raw.raw_capture
        : typeof payload.rawText === "string"
          ? payload.rawText
          : typeof payload.raw_text === "string"
            ? (payload.raw_text as string)
            : "";

  const agentDraftSource = raw.agentDraft
    ? (raw.agentDraft as Record<string, unknown>)
    : payload.agentDraft
      ? (payload.agentDraft as unknown as Record<string, unknown>)
      : (raw.payload ?? raw) as Record<string, unknown>;

  const agentDraft = normalizeAgentDraft(agentDraftSource, rawText);

  const insight =
    typeof raw.insight === "string"
      ? raw.insight
      : typeof payload.insight === "string"
        ? (payload.insight as string)
        : agentDraft.insight;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `qibit-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: coerceIso(raw.createdAt ?? raw.created_at ?? raw.timestamp ?? raw.captured_at),
    updatedAt: coerceIso(raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at ?? raw.timestamp ?? raw.captured_at),
    type: normalizeType(raw.type ?? raw.qibit_type ?? (raw.payload as TimelinePayload | undefined)?.type),
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim()
        : agentDraft.suggestedTitle,
    summary:
      typeof raw.summary === "string" && raw.summary.trim()
        ? raw.summary.trim()
        : typeof payload.summary === "string"
          ? (payload.summary as string)
          : agentDraft.suggestedSummary,
    rawText,
    tags: uniqueStrings(
      Array.isArray(raw.tags)
        ? raw.tags
        : Array.isArray(raw.tags_json)
          ? raw.tags_json
          : Array.isArray(payload.tags)
            ? ((payload.tags ?? []) as string[])
            : agentDraft.suggestedTags,
    ),
    priority: normalizePriority(raw.priority ?? payload.priority),
    status: typeof raw.status === "string" && raw.status ? raw.status : "saved",
    space: normalizeSpace(raw.space ?? raw.bucket_code ?? payload.space ?? agentDraft.suggestedSpace),
    agentDraft,
    insight,
    source:
      typeof raw.source === "string"
        ? raw.source
        : typeof payload.source === "string"
          ? (payload.source as string)
          : "local",
    bucket_code: typeof raw.bucket_code === "string" ? raw.bucket_code : undefined,
    thread_id: typeof raw.thread_id === "string" ? raw.thread_id : null,
    action_required: typeof raw.action_required === "boolean" ? raw.action_required : undefined,
    suggested_action: typeof raw.suggested_action === "string" ? raw.suggested_action : null,
    future_slot: typeof raw.future_slot === "string" ? raw.future_slot : null,
    peopleIds: uniqueStrings(
      Array.isArray(raw.peopleIds)
        ? raw.peopleIds
        : Array.isArray(payload.peopleIds)
          ? ((payload.peopleIds ?? []) as string[])
          : [],
    ),
    linkedPeople: Array.isArray(raw.linkedPeople)
      ? normalizeLinkedPeople(raw.linkedPeople)
      : Array.isArray(payload.linkedPeople)
        ? normalizeLinkedPeople(payload.linkedPeople)
        : undefined,
    linkedActions: Array.isArray(raw.linkedActions)
      ? raw.linkedActions.map((action) => normalizeAction(action as Record<string, unknown>, rawText, typeof raw.id === "string" ? raw.id : null))
      : undefined,
  };
}

function buildTimelinePayload(qibit: QiBit, actions: Action[]): TimelinePayload {
  const linkedActions: TimelineActionLink[] = actions.map((action) => ({
    id: action.id,
    title: action.title,
    status: action.status,
    priority: action.priority,
    dueHint: action.dueHint,
  }));

  return {
    qibitId: qibit.id,
    rawText: qibit.rawText,
    summary: qibit.summary,
    type: qibit.type,
    priority: qibit.priority,
    tags: qibit.tags,
    space: qibit.space,
    createdAt: qibit.createdAt,
    updatedAt: qibit.updatedAt,
    thread_id: qibit.thread_id,
    future_slot: qibit.future_slot,
    peopleIds: qibit.peopleIds,
    linkedPeople: qibit.linkedPeople?.map((person) => ({
      id: person.id,
      display_name: person.display_name,
      relationship: person.relationship,
      type: person.type,
    })),
    linkedActionIds: linkedActions.map((action) => action.id),
    linkedActions,
    insight: qibit.insight,
    source: qibit.source,
    agentDraft: qibit.agentDraft,
  };
}

function normalizeTimelineRow(raw: Record<string, unknown>): TimelineRow {
  const qibit = normalizeQiBit(raw);
  const payloadSource = (raw.payload ?? {}) as Record<string, unknown>;
  const linkedActionIds = Array.isArray(payloadSource.linkedActionIds)
    ? uniqueStrings(payloadSource.linkedActionIds)
    : Array.isArray(payloadSource.linked_actions)
      ? uniqueStrings(payloadSource.linked_actions)
      : [];

  const linkedActions = Array.isArray(payloadSource.linkedActions)
    ? payloadSource.linkedActions.map((action) => {
        const normalized = normalizeAction(action as Record<string, unknown>, qibit.rawText, qibit.id);
        return {
          id: normalized.id,
          title: normalized.title,
          status: normalized.status,
          priority: normalized.priority,
          dueHint: normalized.dueHint,
        };
      })
    : [];

  return {
    id: qibit.id,
    record_type: "qibit",
    title: qibit.title,
    timestamp: qibit.createdAt,
    bucket_code: qibit.space,
    payload: {
      ...buildTimelinePayload(qibit, linkedActions.map((action) => ({
        ...action,
        qibitId: qibit.id,
        createdAt: qibit.createdAt,
        sourceText: qibit.rawText,
      }))),
      linkedActionIds,
      linkedActions: linkedActions.length > 0 ? linkedActions : undefined,
    },
  };
}

function upsertById<T extends { id: string }>(items: T[], next: T): T[] {
  const filtered = items.filter((item) => item.id !== next.id);
  return [next, ...filtered];
}

function sortNewest<T extends { createdAt?: string; created_at?: string; updated_at?: string; started_at?: string; timestamp?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? a.created_at ?? a.updated_at ?? a.started_at ?? a.timestamp ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? b.created_at ?? b.updated_at ?? b.started_at ?? b.timestamp ?? 0).getTime();
    return bTime - aTime;
  });
}

export function getPendingDraft(): Draft | null {
  const data = readJson<Record<string, unknown> | null>(PENDING_DRAFT_KEY, null);
  return data ? normalizeDraft(data) : null;
}

export function savePendingDraft(draft: Draft) {
  writeJson(PENDING_DRAFT_KEY, draft);
}

export function clearPendingDraft() {
  localStorage.removeItem(PENDING_DRAFT_KEY);
}

export function getQiBits(): QiBit[] {
  const stored = readJson<Record<string, unknown>[]>(QIBITS_KEY, []);
  if (stored.length > 0) {
    return sortNewest(stored.map(normalizeQiBit));
  }

  const migrated = readJson<Record<string, unknown>[]>(TIMELINE_KEY, [])
    .map(normalizeTimelineRow)
    .map((row) => normalizeQiBit({ id: row.id, title: row.title, createdAt: row.timestamp, updatedAt: row.payload.updatedAt, ...row.payload }));

  if (migrated.length > 0) {
    writeJson(QIBITS_KEY, migrated);
  }

  return sortNewest(migrated);
}

export function getQiBitById(id: string): QiBit | null {
  return getQiBits().find((qibit) => qibit.id === id) ?? null;
}

export function saveQiBit(qibit: QiBit) {
  const existing = getQiBits();
  writeJson(QIBITS_KEY, sortNewest(upsertById(existing, normalizeQiBit(qibit as unknown as Record<string, unknown>))));
}

export function upsertLocalInboxQiBit(input: {
  id: string;
  createdAt: string;
  rawText: string;
  source: string;
  agentDraft: AgentDraft;
}) {
  const qibit = normalizeQiBit({
    id: input.id,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    type: input.agentDraft.suggestedType,
    title: input.agentDraft.suggestedTitle,
    summary: input.agentDraft.suggestedSummary,
    rawText: input.rawText,
    tags: input.agentDraft.suggestedTags,
    priority: input.agentDraft.suggestedPriority,
    status: "new",
    space: "Inbox",
    source: input.source,
    bucket_code: "00",
    agentDraft: input.agentDraft,
    insight: input.agentDraft.insight,
  } as Record<string, unknown>);

  saveQiBit(qibit);
}

export function replaceQiBits(qibits: QiBit[]) {
  writeJson(QIBITS_KEY, sortNewest(qibits.map((qibit) => normalizeQiBit(qibit as unknown as Record<string, unknown>))));
}

export function getTimelineItems(): TimelineRow[] {
  return sortNewest(readJson<Record<string, unknown>[]>(TIMELINE_KEY, []).map(normalizeTimelineRow));
}

export function getTimelineItemById(id: string): TimelineRow | null {
  return getTimelineItems().find((item) => item.id === id || item.payload.qibitId === id) ?? null;
}

export function saveTimelineItem(item: TimelineRow) {
  const existing = getTimelineItems();
  writeJson(TIMELINE_KEY, sortNewest(upsertById(existing, normalizeTimelineRow(item as unknown as Record<string, unknown>))));
}

export function replaceTimelineItems(items: TimelineRow[]) {
  writeJson(TIMELINE_KEY, sortNewest(items.map((item) => normalizeTimelineRow(item as unknown as Record<string, unknown>))));
}

export function updateTimelineItem(id: string, updates: Partial<TimelineRow>) {
  const next = getTimelineItems().map((item) => {
    if (item.id !== id) return item;
    return normalizeTimelineRow({
      ...item,
      ...updates,
      payload: { ...item.payload, ...(updates.payload ?? {}) },
    } as Record<string, unknown>);
  });
  writeJson(TIMELINE_KEY, next);
}

export function deleteTimelineItem(id: string) {
  const rows = getTimelineItems();
  const row = rows.find((item) => item.id === id);
  const nextRows = rows.filter((item) => item.id !== id);
  writeJson(TIMELINE_KEY, nextRows);

  if (!row) return;

  writeJson(QIBITS_KEY, getQiBits().filter((qibit) => qibit.id !== id));

  const linkedIds = row.payload.linkedActionIds ?? [];
  if (linkedIds.length > 0) {
    writeJson(
      ACTIONS_KEY,
      getActions().filter((action) => !linkedIds.includes(action.id)),
    );
  }
}

export function getActions(): Action[] {
  return sortNewest(readJson<Record<string, unknown>[]>(ACTIONS_KEY, []).map((action) => normalizeAction(action)));
}

export function getActionById(id: string): Action | null {
  return getActions().find((action) => action.id === id) ?? null;
}

export function getActionsForQiBit(qibitId: string): Action[] {
  return getActions().filter((action) => action.qibitId === qibitId || action.source_qibit_id === qibitId);
}

export function getQiBitsForPerson(personId: string): QiBit[] {
  return getQiBits().filter(
    (qibit) =>
      qibit.peopleIds?.includes(personId) ||
      qibit.linkedPeople?.some((person) => person.id === personId),
  );
}

export function saveActions(actions: Action[]) {
  const merged = actions.reduce((all, action) => upsertById(all, normalizeAction(action as unknown as Record<string, unknown>)), getActions());
  writeJson(ACTIONS_KEY, sortNewest(merged));
}

export function replaceActions(actions: Action[]) {
  writeJson(ACTIONS_KEY, sortNewest(actions.map((action) => normalizeAction(action as unknown as Record<string, unknown>))));
}

export function updateAction(id: string, updates: Partial<Action>) {
  const actions = getActions();
  const idx = actions.findIndex((action) => action.id === id);
  if (idx === -1) return;

  const updated = normalizeAction({
    ...actions[idx],
    ...updates,
    completed_at:
      updates.status === "done"
        ? actions[idx].completed_at ?? ISO_NOW()
        : updates.status === "open"
          ? null
          : actions[idx].completed_at,
  } as Record<string, unknown>);

  actions[idx] = updated;
  writeJson(ACTIONS_KEY, sortNewest(actions));

  const rows = getTimelineItems().map((row) => {
    if (!row.payload.linkedActions?.some((action) => action.id === id)) return row;

    return {
      ...row,
      payload: {
        ...row.payload,
        linkedActions: row.payload.linkedActions?.map((action) =>
          action.id === id
            ? { ...action, status: updated.status, priority: updated.priority, dueHint: updated.dueHint }
            : action,
        ),
      },
    };
  });

  writeJson(TIMELINE_KEY, rows);
}

export function updateActionStatus(id: string, status: Action["status"]) {
  updateAction(id, { status });
}

export function deleteAction(id: string) {
  writeJson(ACTIONS_KEY, getActions().filter((action) => action.id !== id));
}

export function saveReviewResult(qibit: QiBit, actions: Action[]) {
  persistReviewResult(qibit, actions);
}

export function persistReviewResult(qibit: QiBit, actions: Action[], timelineItem?: TimelineRow) {
  saveQiBit(qibit);
  saveActions(actions);
  saveTimelineItem(
    timelineItem ?? {
      id: qibit.id,
      record_type: "qibit",
      title: qibit.title,
      timestamp: qibit.createdAt,
      bucket_code: qibit.space,
      payload: buildTimelinePayload(qibit, actions),
    },
  );
  clearPendingDraft();
}

export function getThreads(): Thread[] {
  return sortNewest(readJson<Record<string, unknown>[]>(THREADS_KEY, []).map(normalizeThread));
}

export function saveThread(thread: Thread) {
  const merged = upsertById(getThreads(), normalizeThread(thread as unknown as Record<string, unknown>));
  writeJson(THREADS_KEY, sortNewest(merged));
}

export function replaceThreads(threads: Thread[]) {
  writeJson(THREADS_KEY, sortNewest(threads.map((thread) => normalizeThread(thread as unknown as Record<string, unknown>))));
}

export function getThreadById(id: string): Thread | null {
  return getThreads().find((thread) => thread.id === id) ?? null;
}

export function getPeople(): Person[] {
  return sortNewest(readJson<Record<string, unknown>[]>(PEOPLE_KEY, []).map(normalizePerson));
}

export function savePerson(person: Person) {
  const merged = upsertById(getPeople(), normalizePerson(person as unknown as Record<string, unknown>));
  writeJson(PEOPLE_KEY, sortNewest(merged));
}

export function replacePeople(people: Person[]) {
  writeJson(PEOPLE_KEY, sortNewest(people.map((person) => normalizePerson(person as unknown as Record<string, unknown>))));
}

export function getPersonById(id: string): Person | null {
  return getPeople().find((person) => person.id === id) ?? null;
}

export function getBuckets(): Bucket[] {
  return [
    { code: "inbox", name: "Inbox", is_system: false, slug: "inbox", folder_path: "/inbox", sort_order: 1, description: "" },
    { code: "projects", name: "Projects", is_system: false, slug: "projects", folder_path: "/projects", sort_order: 2, description: "" },
    { code: "areas", name: "Areas", is_system: false, slug: "areas", folder_path: "/areas", sort_order: 3, description: "" },
    { code: "resources", name: "Resources", is_system: false, slug: "resources", folder_path: "/resources", sort_order: 4, description: "" },
    { code: "archive", name: "Archive", is_system: false, slug: "archive", folder_path: "/archive", sort_order: 5, description: "" },
    { code: "00", name: "System", is_system: true, slug: "system", folder_path: "/system", sort_order: 0, description: "" },
  ];
}
