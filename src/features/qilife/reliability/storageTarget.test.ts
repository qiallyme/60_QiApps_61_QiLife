import { describe, expect, it, vi } from "vitest";
import { resolveStorageTarget } from "./storageTarget";

describe("resolveStorageTarget", () => {
  it("uses local storage only when cloud is unconfigured or explicitly bypassed", async () => {
    await expect(resolveStorageTarget({
      configured: false,
      explicitLocalMode: false,
      getSession: vi.fn(),
    })).resolves.toBe("local");

    await expect(resolveStorageTarget({
      configured: true,
      explicitLocalMode: true,
      getSession: vi.fn(),
    })).resolves.toBe("local");
  });

  it("uses cloud only with an authenticated session", async () => {
    await expect(resolveStorageTarget({
      configured: true,
      explicitLocalMode: false,
      getSession: async () => ({ session: { user: { id: "user-1" } }, error: null }),
    })).resolves.toBe("cloud");
  });

  it("never silently falls back when session resolution fails", async () => {
    await expect(resolveStorageTarget({
      configured: true,
      explicitLocalMode: false,
      getSession: async () => ({ session: null, error: new Error("network unavailable") }),
    })).rejects.toThrow("network unavailable");

    await expect(resolveStorageTarget({
      configured: true,
      explicitLocalMode: false,
      getSession: async () => ({ session: null, error: null }),
    })).rejects.toThrow("authenticated cloud session");
  });
});
