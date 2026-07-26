export interface Action {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string | null;
  peopleIds: string[];
  threadId: string | null;
  context: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ActionDraft = Omit<Action, "id" | "createdAt" | "updatedAt">;

export interface ActionFilters {
  query: string;
  status: string;
  projectId: string;
  personId: string;
  due: "" | "due" | "overdue";
  today: string;
}
