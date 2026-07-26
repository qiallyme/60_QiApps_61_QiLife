import { describe, expect, it } from "vitest";
import { filterActions } from "./actionFilters";

describe("filterActions", () => {
  it("filters by project, person, status, and overdue state", () => {
    const actions = [{
      id: "a", title: "Call", status: "next", priority: "high", dueDate: "2026-07-24",
      projectId: "p", peopleIds: ["person"], threadId: null, context: "phone", notes: "",
    }];
    expect(filterActions(actions, {
      query: "call", status: "next", projectId: "p", personId: "person",
      due: "overdue", today: "2026-07-25",
    })).toHaveLength(1);
  });
});
