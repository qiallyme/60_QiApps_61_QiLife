import { describe, expect, it } from "vitest";
import indexHtml from "../../index.html?raw";
import serviceWorker from "../../public/sw.js?raw";

describe("retired application-shell service worker", () => {
  it("does not register a cache-first worker and removes the legacy QiLife cache", () => {
    expect(indexHtml).not.toContain("serviceWorker.register");
    expect(serviceWorker).not.toContain('addEventListener("fetch"');
    expect(serviceWorker).toContain("self.registration.unregister");
    expect(serviceWorker).toContain("caches.delete");
  });
});
