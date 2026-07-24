import { useCallback, useEffect, useRef, useState } from "react";
import type { JournalDraft, JournalSaveStatus } from "../types";

export function useSerializedJournalSave(
  save: (draft: JournalDraft) => Promise<void>,
  delay = 700,
) {
  const [status, setStatus] = useState<JournalSaveStatus>("clean");
  const saveRef = useRef(save);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<JournalDraft | null>(null);
  const queuedRef = useRef(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const persist = useCallback(async (): Promise<void> => {
    if (inFlightRef.current) {
      queuedRef.current = true;
      return;
    }

    const snapshot = latestRef.current;
    if (!snapshot) return;

    inFlightRef.current = true;
    queuedRef.current = false;
    setStatus("saving");

    try {
      await saveRef.current(snapshot);
      inFlightRef.current = false;
      if (queuedRef.current) {
        await persist();
      } else {
        setStatus("clean");
      }
    } catch {
      inFlightRef.current = false;
      queuedRef.current = false;
      setStatus("failed");
    }
  }, []);

  const queue = useCallback((draft: JournalDraft) => {
    latestRef.current = draft;
    queuedRef.current = true;
    setStatus("dirty");

    if (timerRef.current) clearTimeout(timerRef.current);
    if (inFlightRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void persist();
    }, delay);
  }, [delay, persist]);

  const retry = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    queuedRef.current = true;
    await persist();
  }, [persist]);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (status !== "clean") {
      queuedRef.current = true;
      await persist();
    }
  }, [persist, status]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    status,
    queue,
    retry,
    flush,
    hasUnsafeNavigation: status !== "clean",
  };
}
