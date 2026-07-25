import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JournalDraft } from "../types";
import { useSerializedJournalSave } from "./useSerializedJournalSave";

const first: JournalDraft = {
  title: "First",
  entryDate: "2026-07-24",
  bodyMarkdown: "one",
  tags: [],
  pinned: false,
};
const latest = { ...first, title: "Latest", bodyMarkdown: "two" };

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe("useSerializedJournalSave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounces and marks clean only after persistence confirms", async () => {
    const pending = deferred();
    const save = vi.fn(() => pending.promise);
    const { result } = renderHook(() => useSerializedJournalSave(save, 500));

    act(() => result.current.queue(first));
    expect(result.current.status).toBe("dirty");
    expect(save).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(save).toHaveBeenCalledWith(first);
    expect(result.current.status).toBe("saving");

    await act(async () => pending.resolve());
    expect(result.current.status).toBe("clean");
  });

  it("serializes writes and persists the latest queued snapshot", async () => {
    const pending = deferred();
    const save = vi.fn()
      .mockImplementationOnce(() => pending.promise)
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useSerializedJournalSave(save, 500));

    act(() => result.current.queue(first));
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => result.current.queue(latest));

    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve());
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(latest);
    expect(result.current.status).toBe("clean");
  });

  it("retains a failed snapshot and retries it", async () => {
    const save = vi.fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useSerializedJournalSave(save, 500));

    act(() => result.current.queue(first));
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.status).toBe("failed");
    expect(result.current.hasUnsafeNavigation).toBe(true);

    await act(() => result.current.retry());
    expect(save).toHaveBeenLastCalledWith(first);
    expect(result.current.status).toBe("clean");
  });
});
