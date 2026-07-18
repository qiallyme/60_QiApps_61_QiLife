import { WorkbenchEntity, WorkbenchRelationship } from "./entityTypes";

// We retrieve connection details
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://emnskvvajdlqixwzjfsm.supabase.co";
// Legacy key is standard for client public anon connections
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbnNrdnZhamRscWl4d3pqZnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjEyMTAsImV4cCI6MjA5NjkzNzIxMH0.7v_iGqu1BtAWYnwzk0x_tjcd4q3-yNxoHfrJW1bW2Sc";

async function supabaseFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase query failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchEntities(): Promise<WorkbenchEntity[]> {
  return supabaseFetch<WorkbenchEntity[]>("qilife_entities?select=*&order=created_at.desc");
}

export async function fetchRelationships(): Promise<WorkbenchRelationship[]> {
  return supabaseFetch<WorkbenchRelationship[]>("qilife_entity_relationships?select=*");
}

export async function fetchFullWorkbenchData() {
  const [entities, relationships] = await Promise.all([
    fetchEntities(),
    fetchRelationships(),
  ]);

  const entityMap = new Map<string, WorkbenchEntity>();
  entities.forEach((ent) => entityMap.set(ent.id, ent));

  const resolvedRelationships = relationships.map((rel) => ({
    ...rel,
    source_entity: entityMap.get(rel.source_id),
    target_entity: entityMap.get(rel.target_id),
  }));

  return {
    entities,
    relationships: resolvedRelationships,
  };
}
