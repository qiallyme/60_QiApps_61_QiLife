import { Draft, TimelineRow } from "../types";

export const PENDING_DRAFT_KEY = "qilife_pending_draft";
export const TIMELINE_KEY = "qilife_timeline";

export function getPendingDraft(): Draft | null {
  const data = localStorage.getItem(PENDING_DRAFT_KEY);
  return data ? JSON.parse(data) : null;
}

export function savePendingDraft(draft: Draft) {
  localStorage.setItem(PENDING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearPendingDraft() {
  localStorage.removeItem(PENDING_DRAFT_KEY);
}

export function getTimelineItems(): TimelineRow[] {
  const data = localStorage.getItem(TIMELINE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addTimelineItem(item: TimelineRow) {
  const items = getTimelineItems();
  localStorage.setItem(TIMELINE_KEY, JSON.stringify([item, ...items]));
}

export function updateTimelineItem(id: string, updates: Partial<TimelineRow>) {
  const items = getTimelineItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(items));
  }
}

export function deleteTimelineItem(id: string) {
  const items = getTimelineItems().filter(i => i.id !== id);
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(items));
}

export const ACTIONS_KEY = "qilife_actions";

export function getActions(): import("../types").Action[] {
  const data = localStorage.getItem(ACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveActions(actions: import("../types").Action[]) {
  const existing = getActions();
  localStorage.setItem(ACTIONS_KEY, JSON.stringify([...actions, ...existing]));
}

export function updateAction(id: string, updates: Partial<import("../types").Action>) {
  const actions = getActions();
  const idx = actions.findIndex(a => a.id === id);
  if (idx !== -1) {
    actions[idx] = { ...actions[idx], ...updates };
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
  }
}

export function deleteAction(id: string) {
  const actions = getActions().filter(a => a.id !== id);
  localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
}
