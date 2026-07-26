import { describe, expect, it } from "vitest";
import { actionsModule } from "./manifest";

describe("actionsModule", () => {
  it("registers URL-first Actions routes", () => {
    expect(actionsModule.routes.map((route) => route.path)).toEqual([
      "/actions", "/actions/new", "/actions/:id",
    ]);
    expect(actionsModule.recordTypes).toEqual(["task"]);
  });
});
