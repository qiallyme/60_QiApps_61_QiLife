import { useEffect, useState } from "react";
import type { JournalEntry, JournalRepository } from "../types";

export function useJournalEntry(repository: JournalRepository, id: string) {
  const [entry, setEntry] = useState<JournalEntry | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEntry(undefined);
    setError(null);
    repository.get(id)
      .then(setEntry)
      .catch((reason) => {
        setEntry(null);
        setError(reason instanceof Error ? reason.message : "Journal entry is inaccessible.");
      });
  }, [id, repository]);

  return { entry, error, setEntry };
}
