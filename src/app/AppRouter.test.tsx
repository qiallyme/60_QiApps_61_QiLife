import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { createModuleRegistry } from "./moduleRegistry";

vi.mock("../features/qilife/components/QiLifeShell", () => ({
  QiLifeShell: () => <div>Compatibility QiLife shell</div>,
}));

import { AppRouter } from "./AppRouter";

describe("AppRouter", () => {
  it("renders the temporary compatibility shell for existing paths", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByText("Compatibility QiLife shell")).toBeInTheDocument();
  });

  it("renders a module route before the compatibility catch-all", () => {
    const registry = createModuleRegistry([
      {
        key: "journal",
        name: "Journal",
        routes: [
          {
            id: "journal-index",
            path: "/journal",
            Component: () => <p>Journal route</p>,
          },
        ],
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/journal"]}>
        <AppRouter registry={registry} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Journal route")).toBeInTheDocument();
    expect(screen.queryByText("Compatibility QiLife shell")).not.toBeInTheDocument();
  });
});
