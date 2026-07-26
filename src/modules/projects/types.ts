export interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
  dueDate: string | null;
  ownerId: string | null;
  area: string;
  tags: string[];
  brief: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectDraft = Omit<Project, "id" | "createdAt" | "updatedAt">;
