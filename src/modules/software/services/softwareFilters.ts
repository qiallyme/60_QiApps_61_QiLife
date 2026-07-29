import type { QiRecord } from "../../../features/qilife/types";
import type { SoftwareFilters } from "../types";

function daysBetween(from: string, to: string) {
  return Math.ceil((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function softwareAttentionState(record: QiRecord, today: string) {
  const renewalDate = typeof record.data.renewal_date === "string" ? record.data.renewal_date : "";
  const verifiedAt = typeof record.data.last_verified_at === "string" ? record.data.last_verified_at : "";
  const renewalDays = renewalDate ? daysBetween(today, renewalDate) : null;
  const verificationDays = verifiedAt ? daysBetween(verifiedAt, today) : null;
  return {
    renewal: renewalDays === null ? "none" : renewalDays < 0 ? "overdue" : renewalDays <= 30 ? "approaching" : "future",
    verification: verificationDays !== null && verificationDays <= 90 ? "recent" : "stale",
  } as const;
}

export function filterSoftware(records: QiRecord[], filters: SoftwareFilters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return records.filter((record) => {
    if (record.entity_key !== "object" || record.data.object_type !== "software_account") return false;
    if (!filters.includeArchived && record.archived_at) return false;
    const provider = String(record.data.provider ?? "");
    if (query && !`${record.title} ${provider} ${record.data.description ?? ""}`.toLocaleLowerCase().includes(query)) return false;
    if (filters.provider && provider !== filters.provider) return false;
    if (filters.status && record.status !== filters.status) return false;
    const attention = softwareAttentionState(record, filters.today);
    if (filters.renewal && attention.renewal !== filters.renewal) return false;
    if (filters.verification === "recent" && attention.verification !== "recent") return false;
    if (filters.verification === "needs_verification" && attention.verification !== "stale") return false;
    return true;
  });
}
