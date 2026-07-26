import type { QiLifeModule, QiLifeModuleRegistry } from "./moduleTypes";
import { journalModule } from "../modules/journal/manifest";
import { peopleModule } from "../modules/people/manifest";
import { actionsModule } from "../modules/actions/manifest";

function assertUnique(values: readonly string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label} "${value}".`);
    seen.add(value);
  }
}

export function createModuleRegistry(
  modules: readonly QiLifeModule[],
): QiLifeModuleRegistry {
  assertUnique(modules.map((module) => module.key), "QiLife module key");
  const routes = modules.flatMap((module) => module.routes);
  assertUnique(routes.map((route) => route.id), "QiLife module route id");

  return Object.freeze({
    modules: Object.freeze([...modules]),
    routes: Object.freeze(routes),
    navigation: Object.freeze(modules.flatMap((module) => module.navigation ?? [])),
    commands: Object.freeze(modules.flatMap((module) => module.commands ?? [])),
    widgets: Object.freeze(modules.flatMap((module) => module.widgets ?? [])),
    recordTypes: Object.freeze(modules.flatMap((module) => module.recordTypes ?? [])),
  });
}

export const moduleRegistry = createModuleRegistry([journalModule, peopleModule, actionsModule]);
