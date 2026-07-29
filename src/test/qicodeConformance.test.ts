import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const runner = resolve("scripts/validate-qicode-conformance.mjs");

function createContractFixture({
  provisions,
  rows,
}: {
  provisions: unknown[];
  rows: unknown[];
}) {
  const root = mkdtempSync(join(tmpdir(), "qicode-contract-"));
  mkdirSync(join(root, "conformance", "systems"), { recursive: true });
  writeFileSync(
    join(root, "conformance", "provisions.yaml"),
    JSON.stringify({ provisions }, null, 2),
  );
  writeFileSync(
    join(root, "conformance", "systems", "qilife.yaml"),
    JSON.stringify({ system_id: "qilife", conformance: rows }, null, 2),
  );
  return root;
}

describe("QiCode conformance CLI", () => {
  it("accepts an active provision with evidence for aligned status", () => {
    const root = createContractFixture({
      provisions: [{
        id: "QIC-09-04-001",
        citation: "QiCode Sec. 9.04.010",
        status: "active",
      }],
      rows: [{
        system_id: "qilife",
        provision_id: "QIC-09-04-001",
        status: "aligned",
        evidence: [{ type: "repository_path", value: "package.json" }],
        verified_at: "2026-07-29",
        verified_by: "codex",
        notes: "Fixture evidence.",
      }],
    });

    const output = execFileSync(
      process.execPath,
      [runner, "--root", root, "--repository-root", process.cwd()],
      { encoding: "utf8" },
    );

    expect(output).toContain("QiCode conformance valid");
  });

  it.each([
    {
      name: "unknown status",
      provisionStatus: "active",
      rows: [{ provision_id: "QIC-09-04-001", status: "complete", evidence: [] }],
      message: "invalid status",
    },
    {
      name: "unknown provision",
      provisionStatus: "active",
      rows: [{ provision_id: "QIC-99-99-999", status: "partial", evidence: [] }],
      message: "unknown provision",
    },
    {
      name: "aligned without evidence",
      provisionStatus: "active",
      rows: [{ provision_id: "QIC-09-04-001", status: "aligned", evidence: [] }],
      message: "aligned requires evidence",
    },
    {
      name: "superseded provision",
      provisionStatus: "superseded",
      rows: [{ provision_id: "QIC-09-04-001", status: "aligned", evidence: [{ type: "repository_path", value: "package.json" }] }],
      message: "superseded provision",
    },
    {
      name: "duplicate row",
      provisionStatus: "active",
      rows: [
        { provision_id: "QIC-09-04-001", status: "partial", evidence: [] },
        { provision_id: "QIC-09-04-001", status: "partial", evidence: [] },
      ],
      message: "duplicate",
    },
  ])("rejects $name", ({ provisionStatus, rows, message }) => {
    const root = createContractFixture({
      provisions: [{
        id: "QIC-09-04-001",
        citation: "QiCode Sec. 9.04.010",
        status: provisionStatus,
      }],
      rows,
    });

    const result = spawnSync(
      process.execPath,
      [runner, "--root", root, "--repository-root", process.cwd()],
      { encoding: "utf8" },
    );

    expect(result.status).toBe(1);
    expect(`${result.stdout}${result.stderr}`).toContain(message);
  });
});
