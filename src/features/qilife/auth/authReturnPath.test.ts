import { describe, expect, it } from "vitest";
import {
  currentInternalDestination,
  sameOriginAuthRedirect,
} from "./authReturnPath";

describe("authentication return paths", () => {
  it("preserves pathname, search parameters, and hash", () => {
    expect(currentInternalDestination({
      pathname: "/journal/abc",
      search: "?view=raw&code=supabase-code",
      hash: "#section",
    })).toBe("/journal/abc?view=raw&code=supabase-code#section");
  });

  it("creates a same-origin internal redirect", () => {
    expect(sameOriginAuthRedirect(
      "https://life.qially.com",
      "/journal/abc?view=raw#section",
    )).toBe("https://life.qially.com/journal/abc?view=raw#section");
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "javascript:alert(1)",
  ])("rejects external destination %s", (destination) => {
    expect(sameOriginAuthRedirect("https://life.qially.com", destination))
      .toBe("https://life.qially.com/");
  });

  it("falls back to root for malformed values", () => {
    expect(sameOriginAuthRedirect("https://life.qially.com", "http://["))
      .toBe("https://life.qially.com/");
  });
});
