import { useCallback, useEffect, useState } from "react";
import type { JournalEntry, JournalRepository } from "../types";

export function useJournalEntries(repository: JournalRepository) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await repository.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Journal could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { entries, loading, error, reload };
}
