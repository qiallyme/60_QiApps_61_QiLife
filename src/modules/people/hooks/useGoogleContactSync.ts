import { useEffect, useState, useCallback } from "react";
import type { GoogleContactFieldDiff, GoogleContactSnapshot, GoogleContactSyncPlan, Person, SyncResolution } from "../types";
import { createSyncPlan, generateGoogleContactDiff } from "../services/googleContactDiff";
import { getGoogleContactsGateway } from "../store/peopleStore";

export function useGoogleContactSync(person: Person | null) {
  const [snapshot, setSnapshot] = useState<GoogleContactSnapshot | null>(null);
  const [diffs, setDiffs] = useState<GoogleContactFieldDiff[]>([]);
  const [syncPlan, setSyncPlan] = useState<GoogleContactSyncPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSyncState = useCallback(async (p: Person) => {
    if (!p.googleLink?.resourceName) {
      setSnapshot(null);
      setDiffs([]);
      setSyncPlan(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const gateway = getGoogleContactsGateway();
      const snap = await gateway.getContact(p.googleLink.resourceName);
      setSnapshot(snap);

      const computedDiffs = generateGoogleContactDiff(p, snap);
      setDiffs(computedDiffs);

      const plan = createSyncPlan(p, snap);
      setSyncPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load Google Contact sync status"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (person) {
      loadSyncState(person);
    }
  }, [person, loadSyncState]);

  const setResolution = (field: string, resolution: SyncResolution) => {
    if (!syncPlan || !person || !snapshot) return;
    const updatedResolutions = { ...syncPlan.resolutions, [field]: resolution };
    const nextPlan = createSyncPlan(person, snapshot, updatedResolutions);
    setSyncPlan(nextPlan);
  };

  return {
    snapshot,
    diffs,
    syncPlan,
    loading,
    error,
    setResolution,
    refetch: () => person && loadSyncState(person),
  };
}
