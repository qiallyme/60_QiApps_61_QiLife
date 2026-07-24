import { useEffect, useState, useCallback } from "react";
import type { CreatePersonInput, Person, PersonInsight, RelatedRecordReference, UpdatePersonInput } from "../types";
import { getPeopleRepository } from "../store/peopleStore";

export function usePerson(personId?: string) {
  const [person, setPerson] = useState<Person | null>(null);
  const [insights, setInsights] = useState<PersonInsight[]>([]);
  const [relatedRecords, setRelatedRecords] = useState<RelatedRecordReference[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(personId));
  const [error, setError] = useState<Error | null>(null);

  const loadPersonDetails = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const repo = getPeopleRepository();
      const p = await repo.getById(id);
      setPerson(p);

      if (p) {
        const [ins, recs] = await Promise.all([
          repo.getInsights(id),
          repo.listRelatedRecords(id),
        ]);
        setInsights(ins);
        setRelatedRecords(recs);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load person details"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (personId) {
      loadPersonDetails(personId);
    } else {
      setPerson(null);
      setInsights([]);
      setRelatedRecords([]);
      setLoading(false);
    }
  }, [personId, loadPersonDetails]);

  const updatePerson = async (patch: UpdatePersonInput): Promise<Person> => {
    if (!personId) throw new Error("No person ID provided for update.");
    const repo = getPeopleRepository();
    const updated = await repo.update(personId, patch);
    setPerson(updated);
    return updated;
  };

  const createPerson = async (input: CreatePersonInput): Promise<Person> => {
    const repo = getPeopleRepository();
    const created = await repo.create(input);
    setPerson(created);
    return created;
  };

  const archivePerson = async (): Promise<void> => {
    if (!personId) return;
    const repo = getPeopleRepository();
    await repo.archive(personId);
    setPerson(null);
  };

  return {
    person,
    insights,
    relatedRecords,
    loading,
    error,
    updatePerson,
    createPerson,
    archivePerson,
    refetch: () => personId && loadPersonDetails(personId),
  };
}
