import type { QiRecord } from "../types";

export const RECOVERY_SCHEMA = "qilife-recovery-export" as const;
export const RECOVERY_VERSION = 1 as const;

export type RecoveryQiRecord = QiRecord & {
  status: string | null;
  priority: string | null;
  due_date: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export interface QiLifeRecoveryExport {
  schema: typeof RECOVERY_SCHEMA;
  version: typeof RECOVERY_VERSION;
  exported_at: string;
  user_id?: string;
  records: RecoveryQiRecord[];
}

export interface RestorePreview {
  total: number;
  create: number;
  update: number;
  skip: number;
  newerConflict: number;
  byEntity: Record<string, number>;
}

export interface RestoreResult {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  failures: Array<{ id: string; message: string }>;
}

function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isRecord(value: unknown): value is RecoveryQiRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string"
    && typeof record.entity_key === "string"
    && typeof record.title === "string"
    && nullableString(record.status)
    && nullableString(record.priority)
    && nullableString(record.due_date)
    && Boolean(record.data)
    && typeof record.data === "object"
    && !Array.isArray(record.data)
    && typeof record.source === "string"
    && typeof record.created_at === "string"
    && typeof record.updated_at === "string"
    && nullableString(record.archived_at);
}

function assertIsoDate(value: string, field: string) {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`Invalid ${field} timestamp.`);
}

export function createRecoveryExport({
  records,
  exportedAt = new Date().toISOString(),
  userId,
}: {
  records: QiRecord[];
  exportedAt?: string;
  userId?: string;
}): QiLifeRecoveryExport {
  const completeRecords = records.map((record, index) => {
    if (!isRecord(record)) throw new Error(`Cannot export incomplete QiRecord at position ${index + 1}.`);
    return record;
  });
  return {
    schema: RECOVERY_SCHEMA,
    version: RECOVERY_VERSION,
    exported_at: exportedAt,
    ...(userId ? { user_id: userId } : {}),
    records: completeRecords,
  };
}

export function parseRecoveryExport(input: string | unknown): QiLifeRecoveryExport {
  let value: unknown;
  try {
    value = typeof input === "string" ? JSON.parse(input) : input;
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }

  if (!value || typeof value !== "object") throw new Error("Invalid recovery export schema.");
  const candidate = value as Record<string, unknown>;
  if (candidate.schema !== RECOVERY_SCHEMA || candidate.version !== RECOVERY_VERSION) {
    throw new Error("Unsupported or missing recovery export schema version.");
  }
  if (typeof candidate.exported_at !== "string" || !Array.isArray(candidate.records)) {
    throw new Error("Invalid recovery export schema.");
  }
  assertIsoDate(candidate.exported_at, "export");

  const ids = new Set<string>();
  const records = candidate.records.map((record, index) => {
    if (!isRecord(record)) throw new Error(`Invalid QiRecord at position ${index + 1}.`);
    assertIsoDate(record.created_at, `created_at for ${record.id}`);
    assertIsoDate(record.updated_at, `updated_at for ${record.id}`);
    if (record.archived_at) assertIsoDate(record.archived_at, `archived_at for ${record.id}`);
    if (ids.has(record.id)) throw new Error(`Duplicate record ID "${record.id}" in recovery export.`);
    ids.add(record.id);
    return record;
  });

  if (candidate.user_id !== undefined && typeof candidate.user_id !== "string") {
    throw new Error("Invalid user identifier in recovery export.");
  }

  return {
    schema: RECOVERY_SCHEMA,
    version: RECOVERY_VERSION,
    exported_at: candidate.exported_at,
    ...(candidate.user_id ? { user_id: candidate.user_id as string } : {}),
    records,
  };
}

export function previewRecoveryRestore(
  incoming: RecoveryQiRecord[],
  existing: QiRecord[],
): RestorePreview {
  const byId = new Map(existing.map((record) => [record.id, record]));
  const preview: RestorePreview = {
    total: incoming.length,
    create: 0,
    update: 0,
    skip: 0,
    newerConflict: 0,
    byEntity: {},
  };

  for (const record of incoming) {
    preview.byEntity[record.entity_key] = (preview.byEntity[record.entity_key] ?? 0) + 1;
    const current = byId.get(record.id);
    if (!current) preview.create += 1;
    else if (current.updated_at === record.updated_at) preview.skip += 1;
    else if (Date.parse(current.updated_at ?? "") > Date.parse(record.updated_at)) preview.newerConflict += 1;
    else preview.update += 1;
  }
  return preview;
}

export async function restoreRecoveryExport(
  exported: QiLifeRecoveryExport,
  restoreRecords: (records: RecoveryQiRecord[]) => Promise<RestoreResult>,
): Promise<RestoreResult> {
  return restoreRecords(exported.records);
}

export function applyRecoveryToLocalRecords(
  incoming: RecoveryQiRecord[],
  existing: QiRecord[],
): { records: QiRecord[]; result: RestoreResult } {
  const byId = new Map(existing.map((record) => [record.id, record]));
  const result: RestoreResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  };

  for (const record of incoming) {
    const current = byId.get(record.id);
    if (!current) {
      byId.set(record.id, record);
      result.created += 1;
      continue;
    }

    const currentUpdatedAt = Date.parse(current.updated_at ?? "");
    const incomingUpdatedAt = Date.parse(record.updated_at);
    if (Number.isFinite(currentUpdatedAt) && currentUpdatedAt >= incomingUpdatedAt) {
      result.skipped += 1;
      continue;
    }

    byId.set(record.id, record);
    result.updated += 1;
  }

  return { records: [...byId.values()], result };
}

export function recoveryFileName(timestamp = new Date()): string {
  return `qilife-recovery-${timestamp.toISOString().replace(/[:.]/g, "-")}.json`;
}
