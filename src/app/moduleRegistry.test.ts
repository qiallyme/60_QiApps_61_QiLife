import { describe, expect, it } from "vitest";
import { createModuleRegistry } from "./moduleRegistry";
import type { QiLifeModule } from "./moduleTypes";

const Alpha = () => null;

function module(overrides: Partial<QiLifeModule> = {}): QiLifeModule {
  return {
    key: "alpha",
    name: "Alpha",
    routes: [{ id: "alpha-index", path: "/alpha", Component: Alpha }],
    navigation: [{ id: "alpha-nav", label: "Alpha", to: "/alpha", icon: "A" }],
    commands: [{ id: "alpha-new", label: "New Alpha", to: "/alpha/new" }],
    widgets: [{ id: "alpha-widget", label: "Alpha", to: "/alpha" }],
    recordTypes: ["alpha_record"],
    ...overrides,
  };
}

describe("createModuleRegistry", () => {
  it("aggregates capabilities deterministically", () => {
    const registry = createModuleRegistry([module()]);

    expect(registry.routes.map((route) => route.path)).toEqual(["/alpha"]);
    expect(registry.navigation.map((item) => item.to)).toEqual(["/alpha"]);
    expect(registry.commands.map((item) => item.to)).toEqual(["/alpha/new"]);
    expect(registry.widgets.map((item) => item.to)).toEqual(["/alpha"]);
    expect(registry.recordTypes).toEqual(["alpha_record"]);
  });

  it("rejects duplicate module keys", () => {
    expect(() => createModuleRegistry([module(), module()])).toThrow(
      'Duplicate QiLife module key "alpha".',
    );
  });

  it("rejects duplicate route ids", () => {
    expect(() =>
      createModuleRegistry([
        module(),
        module({
          key: "beta",
          name: "Beta",
          routes: [{ id: "alpha-index", path: "/beta", Component: Alpha }],
        }),
      ]),
    ).toThrow('Duplicate QiLife module route id "alpha-index".');
  });
});
