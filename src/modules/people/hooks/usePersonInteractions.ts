import { useEffect, useState, useCallback } from "react";
import type { Interaction } from "../types";
import { getPeopleRepository } from "../store/peopleStore";

export function usePersonInteractions(personId?: string) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(personId));
  const [error, setError] = useState<Error | null>(null);

  const fetchInteractions = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const repo = getPeopleRepository();
      const list = await repo.listInteractions(id);
      setInteractions(list);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load interactions"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (personId) {
      fetchInteractions(personId);
    } else {
      setInteractions([]);
      setLoading(false);
    }
  }, [personId, fetchInteractions]);

  const addInteraction = async (interactionInput: Omit<Interaction, "id">): Promise<Interaction> => {
    const repo = getPeopleRepository();
    const created = await repo.addInteraction(interactionInput);
    setInteractions((prev) => [created, ...prev]);
    return created;
  };

  return {
    interactions,
    loading,
    error,
    addInteraction,
    refetch: () => personId && fetchInteractions(personId),
  };
}
