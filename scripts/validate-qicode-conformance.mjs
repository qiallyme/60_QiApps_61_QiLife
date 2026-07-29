import { existsSync, readFileSync, readdirSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ALLOWED_STATUSES = new Set([
  "aligned",
  "partial",
  "missing",
  "superseded",
  "deferred",
  "not_applicable",
  "unverified",
]);

function readContract(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Unable to parse ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function validateConformance({ root, repositoryRoot }) {
  const errors = [];
  const provisionDocument = readContract(join(root, "conformance", "provisions.yaml"));
  const provisions = Array.isArray(provisionDocument.provisions)
    ? provisionDocument.provisions
    : [];
  const provisionById = new Map();
  const activeContradictions = new Map();

  for (const provision of provisions) {
    if (!provision?.id) {
      errors.push("provision is missing an id");
      continue;
    }
    if (provisionById.has(provision.id)) errors.push(`duplicate provision ${provision.id}`);
    provisionById.set(provision.id, provision);
    if (provision.status === "active" && provision.contradiction_group) {
      const group = provision.contradiction_group;
      activeContradictions.set(group, [...(activeContradictions.get(group) ?? []), provision.id]);
    }
  }

  for (const [group, ids] of activeContradictions) {
    if (ids.length > 1) errors.push(`contradictory active provisions in ${group}: ${ids.join(", ")}`);
  }

  const systemsDirectory = join(root, "conformance", "systems");
  const systemFiles = existsSync(systemsDirectory)
    ? readdirSync(systemsDirectory).filter((name) => /\.ya?ml$/i.test(name))
    : [];
  const seenRows = new Set();

  for (const filename of systemFiles) {
    const document = readContract(join(systemsDirectory, filename));
    const systemId = document.system_id;
    const rows = Array.isArray(document.conformance) ? document.conformance : [];
    for (const row of rows) {
      const rowSystemId = row.system_id ?? systemId;
      const key = `${rowSystemId}:${row.provision_id}`;
      if (seenRows.has(key)) errors.push(`duplicate conformance row ${key}`);
      seenRows.add(key);

      if (!ALLOWED_STATUSES.has(row.status)) errors.push(`${key}: invalid status ${row.status}`);
      const provision = provisionById.get(row.provision_id);
      if (!provision) {
        errors.push(`${key}: unknown provision ${row.provision_id}`);
      } else if (provision.status === "superseded" && row.status === "aligned") {
        errors.push(`${key}: superseded provision cannot be aligned`);
      } else if (provision.status !== "active" && row.status !== "superseded") {
        errors.push(`${key}: provision is not active`);
      }

      const evidence = Array.isArray(row.evidence) ? row.evidence : [];
      if (row.status === "aligned" && evidence.length === 0) {
        errors.push(`${key}: aligned requires evidence`);
      }
      for (const item of evidence) {
        if (item?.type !== "repository_path" || typeof item.value !== "string") continue;
        const evidencePath = isAbsolute(item.value)
          ? item.value
          : resolve(repositoryRoot, item.value);
        if (!existsSync(evidencePath)) errors.push(`${key}: evidence path does not exist: ${item.value}`);
      }
    }
  }

  return errors;
}

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

export function run() {
  const root = resolve(argument("--root", process.env.QICODE_ROOT || "C:\\QiLabs\\40_QiVault\\00_QiCode"));
  const repositoryRoot = resolve(argument("--repository-root", process.cwd()));
  const errors = validateConformance({ root, repositoryRoot });
  if (errors.length) {
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`QiCode conformance valid (${root})`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) run();
