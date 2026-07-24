import type { RouteObject } from "react-router-dom";
import { AppRouter } from "./AppRouter";
import { moduleRegistry } from "./moduleRegistry";
import type { QiLifeModuleRegistry } from "./moduleTypes";

export function createAppRoutes(
  registry: QiLifeModuleRegistry = moduleRegistry,
): RouteObject[] {
  return [{ path: "*", element: <AppRouter registry={registry} /> }];
}
