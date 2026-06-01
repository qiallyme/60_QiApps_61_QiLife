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
