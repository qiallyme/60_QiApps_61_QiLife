const canonicalByEntity: Record<string, string> = {
  project: "project_id",
  person: "people_ids",
  thread: "thread_id",
  object: "object_ids",
};

export function relationStorageKey(entity: string, fieldKey: string): string {
  if (entity === "person" && (fieldKey === "owner" || fieldKey === "lead_person")) {
    return fieldKey === "owner" ? "owner_id" : "lead_person_id";
  }
  return canonicalByEntity[entity] ?? `${fieldKey}_id`;
}

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return typeof value === "string" && value.length > 0 ? [value] : [];
}

export function readRelationIds(
  data: Record<string, unknown>,
  entity: string,
  fieldKey: string,
): string[] {
  const canonical = relationStorageKey(entity, fieldKey);
  const aliases = [
    canonical,
    fieldKey,
    entity,
    `${entity}_id`,
    `${entity}_ids`,
    entity === "person" ? "people_ids" : "",
  ].filter(Boolean);
  for (const key of aliases) {
    const values = strings(data[key]);
    if (values.length) return values;
  }
  return [];
}

export function writeCanonicalRelation(
  data: Record<string, unknown>,
  entity: string,
  fieldKey: string,
  value: string | string[] | null,
): Record<string, unknown> {
  const key = relationStorageKey(entity, fieldKey);
  const next = { ...data };
  next[key] = (entity === "person" && fieldKey === "person") || entity === "object"
    ? strings(value)
    : strings(value)[0] ?? null;
  return next;
}
