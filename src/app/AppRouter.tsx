import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { CompatibilityShellRoute } from "./CompatibilityShellRoute";
import { moduleRegistry } from "./moduleRegistry";
import type { QiLifeModuleRegistry } from "./moduleTypes";
import { ModuleRouteFrame } from "./ModuleRouteFrame";

export function AppRouter({
  registry = moduleRegistry,
}: {
  registry?: QiLifeModuleRegistry;
}) {
  return (
    <Routes>
      {registry.routes.map(({ id, path, Component }) => (
        <Route
          key={id}
          path={path}
          element={
            <ModuleRouteFrame
              label={
                registry.modules.find((module) =>
                  module.routes.some((route) => route.id === id),
                )?.name ?? "QiLife"
              }
            >
              <Suspense fallback={<div className="qilife-empty">Loading screen…</div>}>
                <Component />
              </Suspense>
            </ModuleRouteFrame>
          }
        />
      ))}
      <Route path="*" element={<CompatibilityShellRoute />} />
    </Routes>
  );
}
