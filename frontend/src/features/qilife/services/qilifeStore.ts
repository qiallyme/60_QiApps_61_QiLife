// src/features/qilife/services/qilifeStore.ts
//
// All Supabase calls target the `qilife` schema (migration: 20260623000000).
// Uses the supabase-js v2 `.schema()` chaining.

import { createClient } from "@supabase/supabase-js";
import type { QiCreateRecordInput, QiRecord } from "../types";

// ---------------------------------------------------------------------------
// Client — inline rather than a shared lib so this feature is self-contained.
// Reads the same VITE_ env vars the rest of the app uses.
// ---------------------------------------------------------------------------
const supabaseUrl     = (import.meta.env.VITE_SUPABASE_URL     as string | undefined) ?? "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[qilifeStore] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
    "Add them to .env.local to enable Supabase persistence."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// CRUD helpers
// ---------------------------------------------------------------------------

export async function listRecords(entityKey: string): Promise<QiRecord[]> {
  const { data, error } = await supabase
    .schema("qilife")
    .from("records")
    .select("*")
    .eq("entity_key", entityKey)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as QiRecord[]) ?? [];
}

export async function createRecord(input: QiCreateRecordInput): Promise<QiRecord> {
  const { data, error } = await supabase
    .schema("qilife")
    .from("records")
    .insert({
      entity_key: input.entity_key,
      title:      input.title,
      status:     input.status     ?? null,
      priority:   input.priority   ?? null,
      due_date:   input.due_date   ?? null,
      data:       input.data       ?? {},
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as QiRecord;
}

export async function updateRecord(
  id: string,
  patch: Partial<QiRecord>
): Promise<QiRecord> {
  const { data, error } = await supabase
    .schema("qilife")
    .from("records")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as QiRecord;
}

export async function archiveRecord(id: string): Promise<void> {
  const { error } = await supabase
    .schema("qilife")
    .from("records")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
