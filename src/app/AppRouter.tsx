import { Route, Routes } from "react-router-dom";
import { CompatibilityShellRoute } from "./CompatibilityShellRoute";
import { moduleRegistry } from "./moduleRegistry";
import type { QiLifeModuleRegistry } from "./moduleTypes";

export function AppRouter({
  registry = moduleRegistry,
}: {
  registry?: QiLifeModuleRegistry;
}) {
  return (
    <Routes>
      {registry.routes.map(({ id, path, Component }) => (
        <Route key={id} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<CompatibilityShellRoute />} />
    </Routes>
  );
}
