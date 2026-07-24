import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppRouter } from "../../app/AppRouter";
import { createModuleRegistry } from "../../app/moduleRegistry";
import { journalModule } from "./manifest";
import { JournalNewRoute } from "./routes";

const repositoryMocks = vi.hoisted(() => ({
  list: vi.fn().mockResolvedValue([]),
  get: vi.fn().mockResolvedValue(null),
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock("./services/journalRepository", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("./services/journalRepository")>();
  return {
    ...original,
    journalRepository: repositoryMocks,
  };
});

const registry = createModuleRegistry([journalModule]);

function renderPath(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter registry={registry} />
    </MemoryRouter>,
  );
}

describe("Journal routes", () => {
  it("renders the Journal index route", async () => {
    renderPath("/journal");
    expect(await screen.findByRole("heading", { name: "Journal" })).toBeInTheDocument();
  });

  it("renders the new-entry route", () => {
    renderPath("/journal/new");
    expect(screen.getByRole("heading", { name: "New journal entry" })).toBeInTheDocument();
  });

  it("renders a module-level unavailable state for a missing entry", async () => {
    renderPath("/journal/missing");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Journal entry unavailable" }))
        .toBeInTheDocument();
    });
    expect(screen.queryByText("What matters now?")).not.toBeInTheDocument();
  });

  it("replaces the new route only after confirmed creation", async () => {
    const user = userEvent.setup();
    repositoryMocks.create.mockResolvedValueOnce({
      id: "created-1",
      title: "Today",
      entryDate: "2026-07-24",
      bodyMarkdown: "# Body",
      rawCapture: "# Body",
      tags: [],
      pinned: false,
    });

    function LocationProbe() {
      return <output aria-label="Current path">{useLocation().pathname}</output>;
    }

    render(
      <MemoryRouter initialEntries={["/journal/new"]}>
        <JournalNewRoute />
        <LocationProbe />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Title"), "Today");
    await user.type(screen.getByLabelText("Markdown"), "# Body");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Current path")).toHaveTextContent("/journal/created-1");
    });
  });
});
