import { describe, expect, it } from "vitest";
import { createModuleRegistry } from "../../app/moduleRegistry";
import { peopleModule } from "./manifest";

describe("People module manifest", () => {
  it("registers the URL-first People routes and capabilities", () => {
    const registry = createModuleRegistry([peopleModule]);

    expect(registry.routes.map((route) => route.path)).toEqual([
      "/people",
      "/people/new",
      "/people/:id",
      "/people/:id/edit",
      "/people/:id/sync",
    ]);
    expect(registry.navigation).toContainEqual(expect.objectContaining({ to: "/people" }));
    expect(registry.recordTypes).toContain("person");
  });
});
