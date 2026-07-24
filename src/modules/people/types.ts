/**
 * QiLife People / Personal CRM Core Domain Types
 */

export interface PersonName {
  givenName: string;
  familyName?: string;
  middleName?: string;
  preferredName?: string;
  prefix?: string;
  suffix?: string;
  formattedName: string;
}

export type ContactMethodKind =
  | "email"
  | "mobile_phone"
  | "home_phone"
  | "work_phone"
  | "address"
  | "website"
  | "social_profile"
  | "messaging_handle"
  | "other";

export interface ContactMethod {
  id: string;
  kind: ContactMethodKind;
  label: string;
  value: string;
  isPrimary: boolean;
  verificationState?: "unverified" | "verified" | "failed";
  googleSourceId?: string;
  visibility?: "private" | "shared" | "restricted";
}

export interface PostalAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface OrganizationRelationship {
  organizationName: string;
  jobTitle?: string;
  department?: string;
  roleType?: "employer" | "client" | "vendor" | "partner" | "other";
}

export type RelationshipCategory =
  | "family"
  | "friend"
  | "colleague"
  | "client"
  | "mentor"
  | "service_provider"
  | "acquaintance"
  | "other";

export type RelationshipStatus =
  | "active"
  | "dormant"
  | "archived"
  | "pending_introduction";

export type AttentionLevel = "low" | "medium" | "high" | "urgent";

export interface FollowUp {
  id: string;
  personId: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  direction: "owed_by_me" | "owed_to_me" | "mutual_promise";
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface RelationshipMetadata {
  category: RelationshipCategory;
  status: RelationshipStatus;
  attentionLevel: AttentionLevel;
  firstKnownDate?: string;
  lastMeaningfulContactAt?: string | null;
  nextDesiredContactAt?: string | null;
  communicationCadenceDays?: number; // Target frequency of contact in days
  tags: string[];
  privateNotes?: string;
  boundaries?: string[];
  thingsOwedToThem?: string[];
  thingsOwedToMe?: string[];
  openPromises?: string[];
  followUps?: FollowUp[];
}

export type InteractionType =
  | "call"
  | "text"
  | "email"
  | "meeting"
  | "visit"
  | "favor"
  | "conflict"
  | "check_in"
  | "shared_event";

export type InteractionDirection =
  | "inbound"
  | "outbound"
  | "mutual"
  | "internal_note";

export interface Interaction {
  id: string;
  personId: string;
  timestamp: string;
  type: InteractionType;
  direction: InteractionDirection;
  summary: string;
  body?: string;
  isMeaningful: boolean; // Flag to filter automated pings from last-contact calculations
  sourceModule?: string;
  relatedRecordIds?: string[];
  followUpId?: string;
  externalMetadata?: Record<string, unknown>;
}

export interface InsightEvidence {
  sourceRecordId: string;
  entityType: string;
  description: string;
  timestamp?: string;
  url?: string;
}

export type InsightStatus = "active" | "dismissed" | "confirmed";

export interface PersonInsight {
  id: string;
  personId: string;
  kind: string;
  statement: string;
  status: InsightStatus;
  confidence?: number; // 0.0 to 1.0
  generatedAt: string;
  evidence: InsightEvidence[];
}

export interface GoogleContactLink {
  resourceName: string;
  etag?: string;
  lastSyncedAt: string;
  syncStatus: "in_sync" | "diff_detected" | "conflict" | "error";
}

export interface GoogleContactSnapshot {
  resourceName: string;
  etag?: string;
  names: { givenName: string; familyName?: string; displayName?: string }[];
  emails: { value: string; label?: string; isPrimary?: boolean }[];
  phones: { value: string; label?: string; isPrimary?: boolean }[];
  addresses: { formattedValue: string; city?: string; state?: string; country?: string }[];
  organizations: { name: string; title?: string }[];
  birthdays: { text?: string; year?: number; month?: number; day?: number }[];
  notes?: string;
  updatedAt?: string;
}

export interface GoogleContactFieldDiff {
  field: string;
  qilifeValue: string | null;
  googleValue: string | null;
  status: "match" | "qilife_only" | "google_only" | "conflict";
}

export type SyncResolution = "keep_qilife" | "use_google" | "merge" | "skip";

export interface GoogleContactSyncPlan {
  personId: string;
  googleResourceName: string;
  diffs: GoogleContactFieldDiff[];
  resolutions: Record<string, SyncResolution>;
  generatedAt: string;
}

export interface RelatedRecordReference {
  id: string;
  entityType: string; // e.g. 'journal', 'task', 'project', 'thread', 'document', 'financial'
  title: string;
  timestamp: string;
  summary?: string;
  sourceModule: string;
  relationshipType: string; // e.g. 'mentioned_in', 'assigned_to', 'co_owner', 'attendee'
  targetRoute?: string;
}

export interface Person {
  id: string;
  name: PersonName;
  contactMethods: ContactMethod[];
  addresses: PostalAddress[];
  organization?: OrganizationRelationship;
  birthday?: string;
  relationship: RelationshipMetadata;
  userNotes?: string;
  googleLink?: GoogleContactLink;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  _unknownFields?: Record<string, unknown>; // Preserves unmapped QiRecord JSON properties
}

export interface CreatePersonInput {
  name: PersonName;
  contactMethods?: ContactMethod[];
  addresses?: PostalAddress[];
  organization?: OrganizationRelationship;
  birthday?: string;
  relationship?: Partial<RelationshipMetadata>;
  userNotes?: string;
}

export interface UpdatePersonInput {
  name?: Partial<PersonName>;
  contactMethods?: ContactMethod[];
  addresses?: PostalAddress[];
  organization?: OrganizationRelationship;
  birthday?: string;
  relationship?: Partial<RelationshipMetadata>;
  userNotes?: string;
}

export interface PeopleQuery {
  search?: string;
  category?: RelationshipCategory;
  status?: RelationshipStatus;
  attentionLevel?: AttentionLevel;
  tag?: string;
  needsContact?: boolean; // Derives if days since last contact exceeds cadence
}
