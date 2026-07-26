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
  });
});
