import { hasSupabaseConfig, supabase } from "../../../lib/supabaseClient";
import { qiApiRequest } from "../../../lib/qiApiClient";
import type { QiCreateRecordInput, QiRecord, QiUpdateRecordInput } from "../types";

const LOCAL_KEY = "qilife.local.records.v1";

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function readLocalRecords(): QiRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as QiRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalRecords(records: QiRecord[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
}

async function hasActiveUser(): Promise<boolean> {
  if (!hasSupabaseConfig || !supabase) return false;
  try {
    const { data, error } = await supabase.auth.getSession();
    return !error && Boolean(data.session?.user);
  } catch {
    return false;
  }
}

export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig && Boolean(supabase);
}

export function getStoreMode(hasUser: boolean): "api" | "localStorage" {
  return hasSupabaseConfig && supabase && hasUser ? "api" : "localStorage";
}

export async function listRecords(entityKey: string): Promise<QiRecord[]> {
  if (!(await hasActiveUser())) {
    return readLocalRecords()
      .filter((record) => record.entity_key === entityKey && !record.archived_at)
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  }

  return qiApiRequest<QiRecord[]>(`/v1/life/records?entityKey=${encodeURIComponent(entityKey)}`);
}

export async function listAllRecords(): Promise<QiRecord[]> {
  if (!(await hasActiveUser())) {
    return readLocalRecords()
      .filter((record) => !record.archived_at)
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  }

  return qiApiRequest<QiRecord[]>("/v1/life/records");
}

export async function createRecord(input: QiCreateRecordInput): Promise<QiRecord> {
  if (!(await hasActiveUser())) {
    const records = readLocalRecords();
    const record: QiRecord = {
      id: makeId(),
      entity_key: input.entity_key,
      title: input.title,
      status: input.status ?? null,
      priority: input.priority ?? null,
      due_date: input.due_date ?? null,
      data: input.data ?? {},
      source: "qilife-local",
      created_at: nowIso(),
      updated_at: nowIso(),
      archived_at: null,
    };
    writeLocalRecords([record, ...records]);
    return record;
  }

  return qiApiRequest<QiRecord>("/v1/life/records", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateRecord(id: string, patch: QiUpdateRecordInput): Promise<QiRecord> {
  if (!(await hasActiveUser())) {
    const records = readLocalRecords();
    let updated: QiRecord | null = null;
    const next = records.map((record) => {
      if (record.id !== id) return record;
      updated = {
        ...record,
        ...patch,
        data: patch.data ?? record.data,
        updated_at: nowIso(),
      };
      return updated;
    });
    writeLocalRecords(next);
    if (!updated) throw new Error("Record not found.");
    return updated;
  }

  return qiApiRequest<QiRecord>(`/v1/life/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function archiveRecord(id: string): Promise<void> {
  if (!(await hasActiveUser())) {
    const records = readLocalRecords();
    writeLocalRecords(
      records.map((record) =>
        record.id === id ? { ...record, archived_at: nowIso(), updated_at: nowIso() } : record,
      ),
    );
    return;
  }

  await qiApiRequest<{ archived: boolean }>(`/v1/life/records/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function seedDemoData(): Promise<void> {
  if (await hasActiveUser()) return;

  const existing = await listAllRecords();
  if (existing.length > 0) return;

  await createRecord({
    entity_key: "task",
    title: "Review QiLife and choose the next real action",
    status: "next",
    priority: "high",
    data: {
      title: "Review QiLife and choose the next real action",
      notes: "Do not overbuild. Pick the next slice.",
    },
  });
}
