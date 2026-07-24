import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  Link,
  RouterProvider,
} from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { JournalNavigationGuard } from "./JournalNavigationGuard";

function renderGuard(active: boolean) {
  const retry = vi.fn();
  const router = createMemoryRouter([
    {
      path: "/journal/1",
      element: (
        <>
          <h1>Editor</h1>
          <Link to="/other">Other</Link>
          <JournalNavigationGuard active={active} failed={active} onRetry={retry} />
        </>
      ),
    },
    { path: "/other", element: <h1>Other page</h1> },
  ], { initialEntries: ["/journal/1"] });
  render(<RouterProvider router={router} />);
  return { retry };
}

describe("JournalNavigationGuard", () => {
  it("lets clean navigation proceed", async () => {
    const user = userEvent.setup();
    renderGuard(false);
    await user.click(screen.getByRole("link", { name: "Other" }));
    expect(await screen.findByRole("heading", { name: "Other page" })).toBeInTheDocument();
  });

  it("blocks unsafe navigation and lets the user stay", async () => {
    const user = userEvent.setup();
    renderGuard(true);
    await user.click(screen.getByRole("link", { name: "Other" }));
    expect(screen.getByRole("dialog", { name: "Unsaved journal changes" }))
      .toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Stay" }));
    expect(screen.getByRole("heading", { name: "Editor" })).toBeInTheDocument();
  });

  it("offers retry and explicit leave for failed content", async () => {
    const user = userEvent.setup();
    const { retry } = renderGuard(true);
    await user.click(screen.getByRole("link", { name: "Other" }));
    await user.click(screen.getByRole("button", { name: "Retry save" }));
    expect(retry).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Leave anyway" }));
    expect(await screen.findByRole("heading", { name: "Other page" })).toBeInTheDocument();
  });
});
