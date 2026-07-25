import { QiLifeShell } from "../features/qilife/components/QiLifeShell";

/**
 * Temporary bridge for pre-module state-driven QiLife screens.
 * New screens and modules must register URL-first routes instead.
 */
export function CompatibilityShellRoute() {
  return <QiLifeShell />;
}
