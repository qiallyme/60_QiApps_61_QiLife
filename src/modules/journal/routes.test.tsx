import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
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

  it("protects a modified new-entry draft from navigation", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter([
      { path: "/journal/new", element: <JournalNewRoute /> },
      { path: "/journal", element: <h1>Journal</h1> },
    ], { initialEntries: ["/journal/new"] });
    render(<RouterProvider router={router} />);

    await user.type(screen.getByLabelText("Title"), "Unsaved entry");
    await act(async () => {
      await router.navigate("/journal");
    });

    expect(await screen.findByRole("dialog", { name: "Unsaved journal changes" }))
      .toHaveTextContent("This entry has not been saved.");
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
    const router = createMemoryRouter([
      { path: "/journal/new", element: <JournalNewRoute /> },
      { path: "/journal/:id", element: <LocationProbe /> },
    ], { initialEntries: ["/journal/new"] });
    render(<RouterProvider router={router} />);

    await user.type(screen.getByLabelText("Title"), "Today");
    await user.type(screen.getByLabelText("Markdown"), "# Body");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Current path")).toHaveTextContent("/journal/created-1");
    });
  });

  it("creates from the latest batched draft instead of stale rendered fields", async () => {
    repositoryMocks.create.mockResolvedValueOnce({
      id: "created-batched",
      title: "Batched title",
      entryDate: "2026-07-24",
      bodyMarkdown: "# Exact batched body",
      rawCapture: "# Exact batched body",
      tags: [],
      pinned: false,
    });
    const router = createMemoryRouter([
      { path: "/journal/new", element: <JournalNewRoute /> },
      { path: "/journal/:id", element: <h1>Created</h1> },
    ], { initialEntries: ["/journal/new"] });
    render(<RouterProvider router={router} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText("Title"), {
        target: { value: "Batched title" },
      });
      fireEvent.change(screen.getByLabelText("Markdown"), {
        target: { value: "# Exact batched body" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });

    expect(repositoryMocks.create).toHaveBeenLastCalledWith(expect.objectContaining({
      title: "Batched title",
      bodyMarkdown: "# Exact batched body",
    }));
  });
});
