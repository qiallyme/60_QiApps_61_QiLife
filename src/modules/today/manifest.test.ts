import { describe, expect, it } from "vitest";
import { todayModule } from "./manifest";

describe("todayModule", () => {
  it("owns the URL-first Today route without adding a record type", () => {
    expect(todayModule.routes.map((route) => route.path)).toEqual(["/today"]);
    expect(todayModule.recordTypes).toBeUndefined();
  });
});
