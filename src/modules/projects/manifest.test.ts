import { describe, expect, it } from "vitest";
import { projectsModule } from "./manifest";

describe("projectsModule", () => {
  it("registers all URL-first Project routes", () => {
    expect(projectsModule.routes.map((route) => route.path)).toEqual([
      "/projects", "/projects/new", "/projects/:id", "/projects/:id/edit",
      "/projects/:id/link-person", "/projects/:id/link-document", "/events/new",
    ]);
  });
});
