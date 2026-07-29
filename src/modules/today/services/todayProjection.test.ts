import { describe, expect, it } from "vitest";
import type { QiRecord } from "../../../features/qilife/types";
import { projectToday } from "./todayProjection";

const records: QiRecord[] = [
  { id: "overdue", entity_key: "task", title: "Overdue", status: "next", due_date: "2026-07-24", data: {} },
  { id: "today", entity_key: "task", title: "Today", status: "next", due_date: "2026-07-25", data: {} },
  { id: "upcoming", entity_key: "task", title: "Upcoming", status: "next", due_date: "2026-07-27", data: {} },
  { id: "waiting", entity_key: "task", title: "Waiting", status: "waiting", data: {} },
  { id: "blocked", entity_key: "task", title: "Blocked", status: "blocked", data: {} },
  { id: "project", entity_key: "project", title: "At risk", status: "blocked", data: {} },
  { id: "person", entity_key: "person", title: "Follow up", data: { next_contact_date: "2026-07-25" } },
  { id: "journal", entity_key: "journal_entry", title: "Recent note", updated_at: "2026-07-25T12:00:00Z", data: {} },
  { id: "inbox", entity_key: "qibit", title: "Process me", status: "inbox", data: {} },
  { id: "done", entity_key: "task", title: "Done", status: "done", due_date: "2026-07-24", data: {} },
  { id: "software-renewal", entity_key: "object", title: "Cloudflare", status: "active", data: { object_type: "software_account", renewal_date: "2026-08-01", last_verified_at: "2026-07-20" } },
  { id: "software-stale", entity_key: "object", title: "Supabase", status: "active", data: { object_type: "software_account", last_verified_at: "2025-01-01" } },
  { id: "stale-identifier", entity_key: "object_identifier", title: "Account ID", status: "active", data: { object_id: "software-stale", verified_at: "2025-01-01" } },
  { id: "support-open", entity_key: "object_record", title: "Support request", status: "open", data: { object_id: "software-stale", record_type: "support_request" } },
];

describe("projectToday", () => {
  it("projects actionable shared records into owning-module sections", () => {
    const result = projectToday(records, "2026-07-25");
    expect(result.overdueActions.map((r) => r.id)).toEqual(["overdue"]);
    expect(result.dueTodayActions.map((r) => r.id)).toEqual(["today"]);
    expect(result.upcomingActions.map((r) => r.id)).toEqual(["upcoming"]);
    expect(result.waitingActions.map((r) => r.id)).toEqual(["waiting"]);
    expect(result.blockedActions.map((r) => r.id)).toEqual(["blocked"]);
    expect(result.atRiskProjects.map((r) => r.id)).toEqual(["project"]);
    expect(result.peopleNeedingFollowUp.map((r) => r.id)).toEqual(["person"]);
    expect(result.recentActivity.map((r) => r.id)).toContain("journal");
    expect(result.inboxItems.map((r) => r.id)).toEqual(["inbox"]);
    expect(result.softwareAttention.map((r) => r.id)).toEqual(["software-renewal", "software-stale"]);
    expect(result.staleIdentifiers.map((r) => r.id)).toEqual(["stale-identifier"]);
    expect(result.unresolvedSupport.map((r) => r.id)).toEqual(["support-open"]);
  });
});
