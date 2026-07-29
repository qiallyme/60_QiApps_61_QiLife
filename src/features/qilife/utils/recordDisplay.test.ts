import { describe, expect, it } from "vitest";
import { recordRoute } from "./recordDisplay";

describe("recordRoute", () => {
  it("routes objects and their child records to the stable object detail", () => {
    expect(recordRoute({ id: "object-1", entity_key: "object", title: "Cloudflare", data: { object_type: "software_account" } })).toBe("/software/object-1");
    expect(recordRoute({ id: "history-1", entity_key: "object_record", title: "Support", data: { object_id: "object-1" } })).toBe("/software/object-1");
  });
});
