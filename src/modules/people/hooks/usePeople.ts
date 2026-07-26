import { useEffect, useState, useCallback } from "react";
import type { PeopleQuery, Person } from "../types";
import { getPeopleRepository } from "../store/peopleStore";

export function usePeople(initialQuery?: PeopleQuery) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState<PeopleQuery | undefined>(initialQuery);

  const fetchPeople = useCallback(async (q?: PeopleQuery) => {
    setLoading(true);
    setError(null);
    try {
      const repo = getPeopleRepository();
      const result = await repo.list(q);
      setPeople(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load people"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople(query);
  }, [fetchPeople, query]);

  return {
    people,
    loading,
    error,
    query,
    setQuery,
    refetch: () => fetchPeople(query),
  };
}
