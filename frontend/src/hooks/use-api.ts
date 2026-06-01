import { useCallback, useEffect, useState } from "react";
import { apiFetch, BackendUnavailableError } from "../api/client";

type ApiState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useApi<T>(path: string, initialData: T, refreshToken: number): ApiState<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalToken, setInternalToken] = useState(0);

  const reload = useCallback(() => setInternalToken((n) => n + 1), []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const next = await apiFetch<T>(path);
        if (active) setData(next);
      } catch (caught) {
        if (active) {
          if (caught instanceof BackendUnavailableError) {
            console.warn(`[Mock Fallback] API offline for ${path}. Using empty initial data.`);
            setError(null);
            setData(initialData);
          } else {
            const msg = caught instanceof Error ? caught.message : "Unknown API error";
            setError(msg);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [path, refreshToken, internalToken, initialData]);

  return { data, loading, error, reload };
}
