import { hasSupabaseConfig, supabase } from "../../../lib/supabaseClient";
import { qiApiRequest } from "../../../lib/qiApiClient";
import {
  applyRecoveryToLocalRecords,
  type RecoveryQiRecord,
  type RestoreResult,
} from "../reliability/recoveryService";
import { resolveStorageTarget, type StorageTarget } from "../reliability/storageTarget";
import {
  confirmStorageTarget,
  reportStorageFailure,
} from "../reliability/storageStatus";
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

function explicitLocalMode(): boolean {
  return typeof sessionStorage !== "undefined"
    && sessionStorage.getItem("qilife.local-mode") === "true";
}

async function storageTarget(): Promise<StorageTarget> {
  return resolveStorageTarget({
    configured: hasSupabaseConfig && Boolean(supabase),
    explicitLocalMode: explicitLocalMode(),
    getSession: async () => {
      if (!supabase) return { session: null, error: null };
      try {
        const { data, error } = await supabase.auth.getSession();
        return {
          session: data.session
            ? { user: { id: data.session.user.id } }
            : null,
          error: error ? new Error(error.message) : null,
        };
      } catch (error) {
        return {
          session: null,
          error: error instanceof Error ? error : new Error("Unable to resolve cloud session."),
        };
      }
    },
  });
}

async function withStorageTarget<T>(
  operation: "read" | "write",
  run: (target: StorageTarget) => Promise<T> | T,
): Promise<T> {
  let target: StorageTarget;
  try {
    target = await storageTarget();
  } catch (error) {
    reportStorageFailure(error, operation);
    throw error;
  }

  try {
    const result = await run(target);
    confirmStorageTarget(target);
    return result;
  } catch (error) {
    reportStorageFailure(error, operation, target);
    throw error;
  }
}

export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig && Boolean(supabase);
}

export async function listRecords(entityKey: string): Promise<QiRecord[]> {
  return withStorageTarget("read", (target) => target === "local"
    ? readLocalRecords()
        .filter((record) => record.entity_key === entityKey && !record.archived_at)
        .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
    : qiApiRequest<QiRecord[]>(`/v1/life/records?entityKey=${encodeURIComponent(entityKey)}`));
}

export async function listAllRecords(options: { includeArchived?: boolean } = {}): Promise<QiRecord[]> {
  return withStorageTarget("read", (target) => {
    if (target === "local") {
      return readLocalRecords()
        .filter((record) => options.includeArchived || !record.archived_at)
        .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
    }
    return qiApiRequest<QiRecord[]>(
      `/v1/life/records${options.includeArchived ? "?includeArchived=true" : ""}`,
    );
  });
}

export async function createRecord(input: QiCreateRecordInput): Promise<QiRecord> {
  return withStorageTarget("write", (target) => {
    if (target === "local") {
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
  });
}

export async function updateRecord(id: string, patch: QiUpdateRecordInput): Promise<QiRecord> {
  return withStorageTarget("write", (target) => {
    if (target === "local") {
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
  });
}

export async function archiveRecord(id: string): Promise<void> {
  await withStorageTarget("write", async (target) => {
    if (target === "local") {
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
  });
}

export async function restoreRecords(records: RecoveryQiRecord[]): Promise<RestoreResult> {
  return withStorageTarget("write", async (target) => {
    if (target === "cloud") {
      const combined: RestoreResult = {
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        failures: [],
      };
      for (let index = 0; index < records.length; index += 200) {
        const batch = await qiApiRequest<RestoreResult>("/v1/life/records/restore", {
          method: "POST",
          body: JSON.stringify({ records: records.slice(index, index + 200) }),
        });
        combined.created += batch.created;
        combined.updated += batch.updated;
        combined.skipped += batch.skipped;
        combined.failed += batch.failed;
        combined.failures.push(...batch.failures);
      }
      return combined;
    }

    const restored = applyRecoveryToLocalRecords(records, readLocalRecords());
    writeLocalRecords(restored.records);
    return restored.result;
  });
}

export async function seedDemoData(): Promise<void> {
  if ((await storageTarget()) === "cloud") return;

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
