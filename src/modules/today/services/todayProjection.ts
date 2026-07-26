import type { QiRecord } from "../../../features/qilife/types";

export interface TodayProjection {
  overdueActions: QiRecord[];
  dueTodayActions: QiRecord[];
  upcomingActions: QiRecord[];
  waitingActions: QiRecord[];
  blockedActions: QiRecord[];
  atRiskProjects: QiRecord[];
  peopleNeedingFollowUp: QiRecord[];
  recentActivity: QiRecord[];
  inboxItems: QiRecord[];
}

const closed = new Set(["done", "cancelled", "archived"]);
const meaningfulTypes = new Set(["task", "journal_entry", "event", "decision", "document"]);

function dateValue(record: QiRecord): string {
  return record.updated_at ?? record.created_at ?? "";
}

function followUpDate(record: QiRecord): string | null {
  const relationship = record.data.relationship;
  if (relationship && typeof relationship === "object" && !Array.isArray(relationship)) {
    const value = (relationship as Record<string, unknown>).nextDesiredContactAt;
    if (typeof value === "string") return value.slice(0, 10);
  }
  const legacy = record.data.next_contact_date;
  return typeof legacy === "string" ? legacy.slice(0, 10) : record.due_date?.slice(0, 10) ?? null;
}

export function projectToday(records: QiRecord[], today: string): TodayProjection {
  const active = records.filter((record) => !record.archived_at);
  const actions = active.filter((record) => record.entity_key === "task" && !closed.has(record.status ?? ""));
  const horizon = new Date(`${today}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + 7);
  const upcomingLimit = horizon.toISOString().slice(0, 10);
  const recentFloor = new Date(`${today}T23:59:59Z`);
  recentFloor.setUTCDate(recentFloor.getUTCDate() - 7);

  return {
    overdueActions: actions.filter((record) => Boolean(record.due_date && record.due_date.slice(0, 10) < today)),
    dueTodayActions: actions.filter((record) => record.due_date?.slice(0, 10) === today),
    upcomingActions: actions.filter((record) => {
      const due = record.due_date?.slice(0, 10);
      return Boolean(due && due > today && due <= upcomingLimit);
    }),
    waitingActions: actions.filter((record) => record.status === "waiting"),
    blockedActions: actions.filter((record) => record.status === "blocked"),
    atRiskProjects: active.filter((record) => record.entity_key === "project" && (
      ["blocked", "on_hold", "at_risk"].includes(record.status ?? "")
      || Boolean(record.due_date && record.due_date.slice(0, 10) < today && record.status !== "done")
    )),
    peopleNeedingFollowUp: active.filter((record) => {
      if (record.entity_key !== "person" || record.status === "archived") return false;
      const next = followUpDate(record);
      return Boolean(next && next <= today);
    }),
    recentActivity: active
      .filter((record) => meaningfulTypes.has(record.entity_key) && Boolean(dateValue(record)) && new Date(dateValue(record)) >= recentFloor)
      .sort((left, right) => dateValue(right).localeCompare(dateValue(left)))
      .slice(0, 12),
    inboxItems: active.filter((record) => record.entity_key === "qibit" && (!record.status || record.status === "inbox")),
  };
}
