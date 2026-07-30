import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MobileBottomNav } from "./MobileBottomNav";

describe("MobileBottomNav", () => {
  it("shows five primary URL destinations and a More sheet", async () => {
    render(<MemoryRouter><MobileBottomNav /></MemoryRouter>);
    const navigation = screen.getByRole("navigation", { name: "Primary" });
    for (const label of ["Today", "Actions", "Projects", "People", "Journal"]) {
      expect(navigation).toHaveTextContent(label);
    }
    await userEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("dialog", { name: "More QiLife destinations" })).toHaveTextContent("Software & Services");
    expect(screen.getByRole("link", { name: /Settings/ })).toHaveAttribute("href", "/settings");
  });
});
