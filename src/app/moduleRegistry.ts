import type { QiLifeModule, QiLifeModuleRegistry } from "./moduleTypes";
import { journalModule } from "../modules/journal/manifest";
import { peopleModule } from "../modules/people/manifest";
import { actionsModule } from "../modules/actions/manifest";
import { projectsModule } from "../modules/projects/manifest";
import { todayModule } from "../modules/today/manifest";
import { softwareModule } from "../modules/software/manifest";
import { financeModule } from "../modules/finance/manifest";
import { inboxModule } from "../modules/inbox/manifest";

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
    capabilities: Object.freeze(modules.flatMap((module) => module.capabilities ?? [])),
  });
}

export const moduleRegistry = createModuleRegistry([
  todayModule,
  inboxModule,
  journalModule,
  peopleModule,
  actionsModule,
  projectsModule,
  softwareModule,
  financeModule,
]);
