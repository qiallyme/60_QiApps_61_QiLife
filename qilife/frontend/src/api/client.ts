import type { Action, AgentDraft, KnowledgeCategory, KnowledgeDoc, Person, QiBit, ReviewSaveResponse, Thread, TimelineRow } from "../types";

const rawApiBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export const API_BASE = rawApiBase.replace(/\/$/, "");

export class BackendUnavailableError extends Error {
  constructor(message = "Backend unavailable") {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new BackendUnavailableError();
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (caught) {
    if (caught instanceof BackendUnavailableError) {
      throw caught;
    }

    if (caught instanceof TypeError) {
      throw new BackendUnavailableError();
    }

    throw caught;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  if (!API_BASE) return false;

  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (!response.ok) return false;
    const data = (await response.json()) as { status?: string };
    return data.status === "ok";
  } catch {
    return false;
  }
}

export async function saveReviewToBackend(payload: {
  qibit: QiBit;
  agentDraft: AgentDraft;
  acceptedActions: Action[];
  timeline: Record<string, unknown>;
}): Promise<ReviewSaveResponse> {
  return apiFetch<ReviewSaveResponse>("/api/review/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateActionStatusOnBackend(actionId: string, status: Action["status"], dueHint?: string, sourceText?: string): Promise<Action> {
  return apiFetch<Action>(`/api/actions/${actionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      dueHint,
      sourceText,
    }),
  });
}

export async function listQiBitsFromBackend(): Promise<QiBit[]> {
  return apiFetch<QiBit[]>("/api/qibits");
}

export async function captureQiBitOnBackend(rawText: string): Promise<QiBit> {
  return apiFetch<QiBit>("/api/qibits/capture", {
    method: "POST",
    body: JSON.stringify({
      raw_capture: rawText,
    }),
  });
}

export async function getQiBitFromBackend(id: string): Promise<QiBit> {
  return apiFetch<QiBit>(`/api/qibits/${id}`);
}

export async function listActionsFromBackend(): Promise<Action[]> {
  return apiFetch<Action[]>("/api/actions");
}

export async function getActionFromBackend(id: string): Promise<Action> {
  return apiFetch<Action>(`/api/actions/${id}`);
}

export async function listTimelineFromBackend(): Promise<TimelineRow[]> {
  return apiFetch<TimelineRow[]>("/api/timeline");
}

export async function listThreadsFromBackend(): Promise<Thread[]> {
  return apiFetch<Thread[]>("/api/threads");
}

export async function getThreadFromBackend(id: string): Promise<Thread> {
  return apiFetch<Thread>(`/api/threads/${id}`);
}

export async function createThreadOnBackend(payload: {
  title: string;
  description: string;
  bucket_code: string;
  priority: string;
  next_action?: string | null;
  due_date?: string | null;
}): Promise<Thread> {
  return apiFetch<Thread>("/api/threads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listPeopleFromBackend(): Promise<Person[]> {
  return apiFetch<Person[]>("/api/people");
}

export async function getPersonFromBackend(id: string): Promise<Person> {
  return apiFetch<Person>(`/api/people/${id}`);
}

export async function createPersonOnBackend(payload: {
  display_name: string;
  legal_name: string;
  type: string;
  relationship: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}): Promise<Person> {
  return apiFetch<Person>("/api/people", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listKnowledgeDocs(): Promise<KnowledgeCategory[]> {
  return apiFetch<KnowledgeCategory[]>("/api/knowledge/docs");
}

export async function searchKnowledgeDocs(query: string): Promise<KnowledgeDoc[]> {
  const encoded = encodeURIComponent(query);
  return apiFetch<KnowledgeDoc[]>(`/api/knowledge/search?q=${encoded}`);
}

export async function getKnowledgeDoc(docId: string): Promise<KnowledgeDoc> {
  return apiFetch<KnowledgeDoc>(`/api/knowledge/docs/${docId}`);
}
