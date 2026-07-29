import { describe, expect, it } from "vitest";
import { softwareModule } from "./manifest";

describe("Software & Services manifest", () => {
  it("registers every URL-first Software route", () => {
    expect(softwareModule.name).toBe("Software & Services");
    expect(softwareModule.routes.map((route) => route.path)).toEqual([
      "/software",
      "/software/new",
      "/software/:id",
      "/software/:id/edit",
      "/software/:id/history",
    ]);
    expect(softwareModule.recordTypes).toEqual([
      "object",
      "object_identifier",
      "object_relationship",
      "object_record",
      "secret_reference",
    ]);
  });
});
