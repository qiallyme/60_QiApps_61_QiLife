# Cadence → QiLife Prototype Mapping

> **Branch**: `alpha/qicadence`
> **Date**: 2026-06-16
> **Status**: Discovery / analysis only — not wired into production

---

## Purpose

This directory contains mapping files that document how Cadence's entity model and
navigation structure translate to QiLife's architecture. These files are reference
artifacts, not executable code.

## Contents

| File               | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `README.md`        | This file                                                  |
| `entityMap.json`   | Field-level mapping: Cadence entities → QiLife types       |
| `navMap.json`      | Navigation mapping: Cadence surfaces → QiLife routes       |

## Related Documents

- [Cadence Reference Analysis](../../docs/architecture/cadence_reference_analysis.md)
- [QiLife Entity Contract](../../docs/architecture/qilife_markdown_entity_contract.md)
- [ADR-0001: Cadence as Reference](../../docs/decisions/ADR-0001_cadence_as_qilife_workbench_reference.md)

## Hard Rules (from project brief)

1. ❌ Do not modify production QiLife routes
2. ❌ Do not rewrite the app
3. ❌ Do not wire Cadence into the app
4. ❌ Do not add Supabase sync
5. ❌ Do not build two-way sync
6. ❌ Do not delete existing files
7. ✅ Keep all changes isolated to `docs/` and `prototypes/`
8. ✅ Preserve MIT license attribution

## Attribution

Based on [Cadence](https://github.com/wesswart77/obsidian-cadence) by Wesley Swart.
MIT License © 2026 Wesley Swart.
