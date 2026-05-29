import { useEffect, useState } from "react";

import { apiFetch } from "../api/client";

type ApiState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

export function useApi<T>(path: string, initialData: T, refreshToken: number): ApiState<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const nextData = await apiFetch<T>(path);
        if (active) {
          setData(nextData);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unknown API error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [path, refreshToken]);

  return { data, loading, error };
}
