import type { Action, ActionFilters } from "../types";

export function filterActions(actions: Action[], filters: ActionFilters): Action[] {
  const query = filters.query.trim().toLowerCase();
  return actions.filter((action) => {
    if (query && !`${action.title} ${action.notes} ${action.context}`.toLowerCase().includes(query)) return false;
    if (filters.status && action.status !== filters.status) return false;
    if (filters.projectId && action.projectId !== filters.projectId) return false;
    if (filters.personId && !action.peopleIds.includes(filters.personId)) return false;
    if (filters.due === "overdue" && (!action.dueDate || action.dueDate >= filters.today || action.status === "done")) return false;
    if (filters.due === "due" && action.dueDate !== filters.today) return false;
    return true;
  });
}
