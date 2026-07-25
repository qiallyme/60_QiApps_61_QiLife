import { render, screen } from "@testing-library/react";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { JournalNavigationGuard } from "../modules/journal/components/JournalNavigationGuard";
import { createAppRoutes } from "./createAppRoutes";
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

  it("provides the data-router context required by module navigation blockers", () => {
    const registry = createModuleRegistry([
      {
        key: "guarded",
        name: "Guarded",
        routes: [
          {
            id: "guarded-route",
            path: "/guarded",
            Component: () => (
              <>
                <p>Guarded route</p>
                <JournalNavigationGuard active={false} failed={false} onRetry={vi.fn()} />
              </>
            ),
          },
        ],
      },
    ]);
    const router = createMemoryRouter(createAppRoutes(registry), {
      initialEntries: ["/guarded"],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByText("Guarded route")).toBeInTheDocument();
  });
});
