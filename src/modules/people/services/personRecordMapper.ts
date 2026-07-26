import type { QiCreateRecordInput, QiRecord, QiUpdateRecordInput } from "../../../features/qilife/types";
import type { Person, PersonName, ContactMethod, PostalAddress, OrganizationRelationship, RelationshipMetadata } from "../types";

export const PERSON_ENTITY_KEY = "person";

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Converts a generic QiRecord into a strongly-typed Person domain object.
 * Preserves unmapped fields inside `_unknownFields`.
 */
export function toPerson(record: QiRecord): Person {
  const d = (record.data || {}) as Record<string, unknown>;

  // Extract known identity fields
  const nameData = (d.name as Record<string, unknown>) || {};
  const givenName = (nameData.givenName as string) || record.title || "Unnamed Person";
  const familyName = nameData.familyName as string | undefined;
  const preferredName = nameData.preferredName as string | undefined;
  const formattedName =
    (nameData.formattedName as string) ||
    [givenName, familyName].filter(Boolean).join(" ") ||
    record.title ||
    "Unnamed Person";

  const name: PersonName = {
    givenName,
    familyName,
    middleName: nameData.middleName as string | undefined,
    preferredName,
    prefix: nameData.prefix as string | undefined,
    suffix: nameData.suffix as string | undefined,
    formattedName,
  };

  const contactMethods = Array.isArray(d.contactMethods)
    ? (d.contactMethods as ContactMethod[])
    : [];

  const addresses = Array.isArray(d.addresses)
    ? (d.addresses as PostalAddress[])
    : [];

  const organization = d.organization
    ? (d.organization as OrganizationRelationship)
    : undefined;

  const relationshipData = (d.relationship as Record<string, unknown>) || {};

  const relationship: RelationshipMetadata = {
    category: (relationshipData.category as RelationshipMetadata["category"]) || "acquaintance",
    status: (relationshipData.status as RelationshipMetadata["status"]) || record.status || "active",
    attentionLevel: (relationshipData.attentionLevel as RelationshipMetadata["attentionLevel"]) || record.priority || "medium",
    firstKnownDate: relationshipData.firstKnownDate as string | undefined,
    lastMeaningfulContactAt: relationshipData.lastMeaningfulContactAt as string | undefined ?? null,
    nextDesiredContactAt: (relationshipData.nextDesiredContactAt as string | undefined) ?? record.due_date ?? null,
    communicationCadenceDays: typeof relationshipData.communicationCadenceDays === "number" ? relationshipData.communicationCadenceDays : 30,
    tags: Array.isArray(relationshipData.tags) ? (relationshipData.tags as string[]) : [],
    privateNotes: relationshipData.privateNotes as string | undefined,
    boundaries: Array.isArray(relationshipData.boundaries) ? (relationshipData.boundaries as string[]) : [],
    thingsOwedToThem: Array.isArray(relationshipData.thingsOwedToThem) ? (relationshipData.thingsOwedToThem as string[]) : [],
    thingsOwedToMe: Array.isArray(relationshipData.thingsOwedToMe) ? (relationshipData.thingsOwedToMe as string[]) : [],
    openPromises: Array.isArray(relationshipData.openPromises) ? (relationshipData.openPromises as string[]) : [],
    followUps: Array.isArray(relationshipData.followUps) ? (relationshipData.followUps as RelationshipMetadata["followUps"]) : [],
  };

  // Collect unknown fields to avoid data loss
  const knownKeys = new Set([
    "name",
    "contactMethods",
    "addresses",
    "organization",
    "birthday",
    "relationship",
    "userNotes",
    "googleLink",
  ]);

  const _unknownFields: Record<string, unknown> = {};
  Object.keys(d).forEach((key) => {
    if (!knownKeys.has(key)) {
      _unknownFields[key] = d[key];
    }
  });

  return {
    id: record.id,
    name,
    contactMethods,
    addresses,
    organization,
    birthday: d.birthday as string | undefined,
    relationship,
    userNotes: d.userNotes as string | undefined,
    googleLink: d.googleLink as Person["googleLink"],
    createdAt: record.created_at || nowIso(),
    updatedAt: record.updated_at || nowIso(),
    archivedAt: record.archived_at ?? null,
    _unknownFields: Object.keys(_unknownFields).length > 0 ? _unknownFields : undefined,
  };
}

/**
 * Converts a Person domain object into a QiCreateRecordInput for persistence.
 * Merges existing JSON data to preserve unknown fields.
 */
export function toQiCreateRecordInput(person: Omit<Person, "id" | "createdAt" | "updatedAt">): QiCreateRecordInput {
  const data: Record<string, unknown> = {
    ...(person._unknownFields || {}),
    name: person.name,
    contactMethods: person.contactMethods,
    addresses: person.addresses,
    organization: person.organization,
    birthday: person.birthday,
    relationship: person.relationship,
    userNotes: person.userNotes,
    googleLink: person.googleLink,
  };

  return {
    entity_key: PERSON_ENTITY_KEY,
    title: person.name.formattedName || person.name.givenName || "Unnamed Person",
    status: person.relationship.status,
    priority: person.relationship.attentionLevel,
    due_date: person.relationship.nextDesiredContactAt ?? null,
    data,
  };
}

/**
 * Converts an updated Person into a QiUpdateRecordInput for persistence.
 * Preserves existing record unknown fields.
 */
export function toQiUpdateRecordInput(person: Person, existingRecord?: QiRecord): QiUpdateRecordInput {
  const existingData = (existingRecord?.data || {}) as Record<string, unknown>;

  const data: Record<string, unknown> = {
    ...existingData,
    ...(person._unknownFields || {}),
    name: person.name,
    contactMethods: person.contactMethods,
    addresses: person.addresses,
    organization: person.organization,
    birthday: person.birthday,
    relationship: person.relationship,
    userNotes: person.userNotes,
    googleLink: person.googleLink,
  };

  return {
    title: person.name.formattedName || person.name.givenName || "Unnamed Person",
    status: person.relationship.status,
    priority: person.relationship.attentionLevel,
    due_date: person.relationship.nextDesiredContactAt ?? null,
    data,
  };
}
