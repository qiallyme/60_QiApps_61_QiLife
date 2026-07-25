import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { JournalWidget } from "./JournalWidget";

describe("JournalWidget", () => {
  it("offers router-native Journal and new-entry links", () => {
    render(
      <MemoryRouter>
        <JournalWidget to="/journal" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Open Journal" }))
      .toHaveAttribute("href", "/journal");
    expect(screen.getByRole("link", { name: "Quick journal" }))
      .toHaveAttribute("href", "/journal/new");
  });
});
