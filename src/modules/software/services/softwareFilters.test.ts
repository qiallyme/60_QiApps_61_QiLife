import { describe, expect, it } from "vitest";
import type { QiRecord } from "../../../features/qilife/types";
import { filterSoftware, softwareAttentionState } from "./softwareFilters";

function software(id: string, overrides: Partial<QiRecord> & { data?: Record<string, unknown> } = {}): QiRecord {
  return {
    id,
    entity_key: "object",
    title: id,
    status: "active",
    data: {
      object_type: "software_account",
      provider: id,
      renewal_date: null,
      last_verified_at: "2026-07-01",
      ...overrides.data,
    },
    archived_at: null,
    ...overrides,
  };
}

describe("Software & Services filtering", () => {
  const records = [
    software("Cloudflare", { data: { object_type: "software_account", provider: "Cloudflare", renewal_date: "2026-08-05", last_verified_at: "2026-07-20" } }),
    software("Supabase", { status: "paused", data: { object_type: "software_account", provider: "Supabase", renewal_date: null, last_verified_at: "2025-12-01" } }),
    software("Vehicle", { data: { object_type: "vehicle" } }),
    software("Archived", { archived_at: "2026-07-01T00:00:00Z", data: { object_type: "software_account", provider: "GitHub" } }),
  ];

  it("searches and filters provider status verification and archive state", () => {
    expect(filterSoftware(records, { query: "cloud", provider: "", status: "", renewal: "", verification: "", includeArchived: false, today: "2026-07-29" }).map(r => r.id)).toEqual(["Cloudflare"]);
    expect(filterSoftware(records, { query: "", provider: "Supabase", status: "paused", renewal: "", verification: "needs_verification", includeArchived: false, today: "2026-07-29" }).map(r => r.id)).toEqual(["Supabase"]);
    expect(filterSoftware(records, { query: "", provider: "", status: "", renewal: "", verification: "", includeArchived: true, today: "2026-07-29" }).map(r => r.id)).toEqual(["Cloudflare", "Supabase", "Archived"]);
  });

  it("derives renewal and verification attention deterministically", () => {
    expect(softwareAttentionState(records[0], "2026-07-29")).toMatchObject({ renewal: "approaching", verification: "recent" });
    expect(softwareAttentionState(records[1], "2026-07-29")).toMatchObject({ renewal: "none", verification: "stale" });
  });
});
