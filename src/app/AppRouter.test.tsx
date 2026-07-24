import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

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
});
