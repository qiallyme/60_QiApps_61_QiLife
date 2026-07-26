import { useSyncExternalStore } from "react";

export type StorageStatusKind = "cloud" | "local" | "offline" | "sync_error";

export interface StorageStatus {
  kind: StorageStatusKind;
  detail: string;
  lastConfirmedAt: string | null;
}

const listeners = new Set<() => void>();
let status: StorageStatus = {
  kind: "local",
  detail: "Stored only in this browser",
  lastConfirmedAt: null,
};

function emit() {
  listeners.forEach((listener) => listener());
}

export function getStorageStatus(): StorageStatus {
  return status;
}

export function setStorageStatus(next: StorageStatus) {
  status = next;
  emit();
}

export function confirmStorageTarget(target: "cloud" | "local") {
  setStorageStatus(target === "cloud"
    ? {
        kind: "cloud",
        detail: "Authenticated and synchronized",
        lastConfirmedAt: new Date().toISOString(),
      }
    : {
        kind: "local",
        detail: "Stored only in this browser",
        lastConfirmedAt: new Date().toISOString(),
      });
}

export function reportStorageFailure(
  error: unknown,
  operation: "read" | "write",
  target: "cloud" | "local" = "cloud",
) {
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  const message = error instanceof Error ? error.message : "Unknown storage failure.";
  setStorageStatus({
    kind: offline ? "offline" : "sync_error",
    detail: offline
      ? "Cloud account available but currently disconnected"
      : operation === "write"
        ? target === "cloud"
          ? `Changes may not have reached cloud storage. ${message}`
          : `Changes may not have reached browser storage. ${message}`
        : target === "cloud"
          ? `Cloud synchronization could not be confirmed. ${message}`
          : `Browser storage could not be read. ${message}`,
    lastConfirmedAt: status.lastConfirmedAt,
  });
}

export function initializeStorageStatus({
  configured,
  localMode,
  authenticated,
}: {
  configured: boolean;
  localMode: boolean;
  authenticated: boolean;
}) {
  if (!configured || localMode) {
    setStorageStatus({
      kind: "local",
      detail: "Stored only in this browser",
      lastConfirmedAt: null,
    });
  } else if (authenticated && typeof navigator !== "undefined" && navigator.onLine === false) {
    setStorageStatus({
      kind: "offline",
      detail: "Cloud account available but currently disconnected",
      lastConfirmedAt: status.lastConfirmedAt,
    });
  } else if (authenticated) {
    setStorageStatus({
      kind: "cloud",
      detail: "Checking cloud synchronization",
      lastConfirmedAt: status.lastConfirmedAt,
    });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStorageStatus(): StorageStatus {
  return useSyncExternalStore(subscribe, getStorageStatus, getStorageStatus);
}
