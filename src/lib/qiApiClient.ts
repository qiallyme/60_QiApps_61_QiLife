import { supabase } from "./supabaseClient";

const configuredBaseUrl = import.meta.env.VITE_QI_API_URL as string | undefined;
export const qiApiBaseUrl = (configuredBaseUrl || "https://api.qially.com").replace(/\/$/, "");

interface SuccessEnvelope<T> {
  ok: true;
  data: T;
  meta?: { requestId?: string };
}

interface ErrorEnvelope {
  ok: false;
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
  };
}

async function getAccessToken(): Promise<string> {
  if (!supabase) throw new Error("Supabase authentication is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("Your QiLife session has expired. Sign in again.");
  return token;
}

export async function qiApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  if (init.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${qiApiBaseUrl}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null) as SuccessEnvelope<T> | ErrorEnvelope | null;

  if (!response.ok || payload?.ok !== true) {
    const errorPayload = payload && payload.ok === false ? payload.error : undefined;
    const message = errorPayload?.message || `Qi API request failed with status ${response.status}.`;
    const requestId = errorPayload?.requestId;
    throw new Error(requestId ? `${message} Request ID: ${requestId}` : message);
  }

  return payload.data;
}

export async function checkQiLifeApi(): Promise<boolean> {
  try {
    const status = await qiApiRequest<{ module: string; status: string }>("/v1/life/status");
    return status.module === "life" && status.status === "ready";
  } catch {
    return false;
  }
}
