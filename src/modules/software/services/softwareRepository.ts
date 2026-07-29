import {
  archiveRecord,
  createRecord,
  listAllRecords,
  updateRecord,
} from "../../../features/qilife/services/qilifeStore";
import type { QiRecord } from "../../../features/qilife/types";
import type { SoftwareDraft } from "../types";

function dataFromDraft(draft: SoftwareDraft) {
  return {
    object_type: "software_account",
    description: draft.description,
    sensitivity: draft.sensitivity,
    schema_version: 1,
    primary_identifier_id: null,
    last_verified_at: draft.lastVerifiedAt || null,
    archived_at: null,
    provider: draft.provider,
    primary_url: draft.primaryUrl,
    admin_url: draft.adminUrl,
    plan: draft.plan,
    billing_cadence: draft.billingCadence,
    renewal_date: draft.renewalDate || null,
    owner_administrator: draft.ownerAdministrator,
    organization_workspace: draft.organizationWorkspace,
    support_contact: draft.supportContact,
    notes: draft.notes,
  };
}

export function draftFromSoftwareRecord(record: QiRecord): SoftwareDraft {
  const value = (key: string) => typeof record.data[key] === "string" ? String(record.data[key]) : "";
  return {
    provider: value("provider"),
    title: record.title,
    description: value("description"),
    status: record.status ?? "active",
    loginEmail: "",
    username: "",
    primaryUrl: value("primary_url"),
    adminUrl: value("admin_url"),
    plan: value("plan"),
    billingCadence: value("billing_cadence"),
    renewalDate: value("renewal_date"),
    ownerAdministrator: value("owner_administrator"),
    organizationWorkspace: value("organization_workspace"),
    supportContact: value("support_contact"),
    notes: value("notes"),
    sensitivity: (value("sensitivity") || "private") as SoftwareDraft["sensitivity"],
    lastVerifiedAt: value("last_verified_at"),
  };
}

export const emptySoftwareDraft: SoftwareDraft = {
  provider: "",
  title: "",
  description: "",
  status: "active",
  loginEmail: "",
  username: "",
  primaryUrl: "",
  adminUrl: "",
  plan: "",
  billingCadence: "",
  renewalDate: "",
  ownerAdministrator: "",
  organizationWorkspace: "",
  supportContact: "",
  notes: "",
  sensitivity: "private",
  lastVerifiedAt: "",
};

export const softwareRepository = {
  async list(includeArchived = false) {
    return (await listAllRecords({ includeArchived }))
      .filter((record) => record.entity_key === "object" && record.data.object_type === "software_account");
  },
  async get(id: string) {
    return (await listAllRecords({ includeArchived: true }))
      .find((record) => record.entity_key === "object" && record.id === id && record.data.object_type === "software_account") ?? null;
  },
  create(draft: SoftwareDraft) {
    return createRecord({ entity_key: "object", title: draft.title.trim(), status: draft.status, data: dataFromDraft(draft) });
  },
  update(id: string, draft: SoftwareDraft) {
    return updateRecord(id, { title: draft.title.trim(), status: draft.status, data: dataFromDraft(draft) });
  },
  archive: archiveRecord,
  async markVerified(record: QiRecord, date = new Date().toISOString().slice(0, 10)) {
    return updateRecord(record.id, { data: { ...record.data, last_verified_at: date } });
  },
};
