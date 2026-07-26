import { afterEach, describe, expect, it, vi } from "vitest";
import {
  confirmStorageTarget,
  getStorageStatus,
  reportStorageFailure,
  setStorageStatus,
} from "./storageStatus";

describe("storage status", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setStorageStatus({
      kind: "local",
      detail: "Stored only in this browser",
      lastConfirmedAt: null,
    });
  });

  it("distinguishes confirmed cloud and local persistence", () => {
    confirmStorageTarget("cloud");
    expect(getStorageStatus()).toMatchObject({
      kind: "cloud",
      detail: "Authenticated and synchronized",
    });

    confirmStorageTarget("local");
    expect(getStorageStatus()).toMatchObject({
      kind: "local",
      detail: "Stored only in this browser",
    });
  });

  it("reports cloud write failures without claiming synchronization", () => {
    vi.stubGlobal("navigator", { onLine: true });
    reportStorageFailure(new Error("request failed"), "write", "cloud");

    expect(getStorageStatus()).toMatchObject({
      kind: "sync_error",
      detail: expect.stringContaining("Changes may not have reached cloud storage"),
    });
  });

  it("reports an authenticated disconnection as offline", () => {
    vi.stubGlobal("navigator", { onLine: false });
    reportStorageFailure(new Error("network unavailable"), "read", "cloud");

    expect(getStorageStatus()).toMatchObject({
      kind: "offline",
      detail: "Cloud account available but currently disconnected",
    });
  });
});
