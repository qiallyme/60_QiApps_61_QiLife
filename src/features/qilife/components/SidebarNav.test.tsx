import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SidebarNav } from "./SidebarNav";

describe("SidebarNav module navigation", () => {
  it("renders registered modules as router-native links", () => {
    render(
      <MemoryRouter>
        <SidebarNav
          activeWorkspaceKey={null}
          activeViewKey={null}
          moduleNavigation={[{
            id: "journal-nav",
            label: "Journal",
            to: "/journal",
            icon: "✎",
          }]}
          onSelectWorkspace={vi.fn()}
          onSelectView={vi.fn()}
          onHome={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Journal/ }))
      .toHaveAttribute("href", "/journal");
  });
});
