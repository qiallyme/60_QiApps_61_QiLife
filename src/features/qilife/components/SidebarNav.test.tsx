import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SidebarNav } from "./SidebarNav";

describe("SidebarNav operating hierarchy", () => {
  it("renders group labels and router-native destination links", () => {
    render(
      <MemoryRouter>
        <SidebarNav
          activeWorkspaceKey={null}
          activeViewKey={null}
          moduleNavigation={[]}
          onSelectWorkspace={vi.fn()}
          onSelectView={vi.fn()}
          onHome={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("PLANNER")).not.toHaveAttribute("href");
    expect(screen.queryByRole("link", { name: /^Planner$/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Actions/ })).toHaveAttribute("href", "/actions");
    expect(screen.getByRole("link", { name: /Projects/ })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: /Journal/ })).toHaveAttribute("href", "/journal");
    expect(screen.getByRole("link", { name: /People/ })).toHaveAttribute("href", "/people");
  });
});
