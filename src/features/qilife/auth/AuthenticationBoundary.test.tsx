import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "./AuthProvider";
import { AuthenticationBoundary } from "./AuthenticationBoundary";

const baseAuth = {
  user: null,
  loading: false,
  localMode: false,
  signInWithMagicLink: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  enableLocalMode: vi.fn(),
};

describe("AuthenticationBoundary", () => {
  it("shows one login boundary for unauthenticated configured routes", () => {
    render(
      <AuthContext.Provider value={baseAuth}>
        <AuthenticationBoundary configured><div>Private route</div></AuthenticationBoundary>
      </AuthContext.Provider>,
    );
    expect(screen.getByRole("heading", { name: "Welcome to QiLife" })).toBeInTheDocument();
    expect(screen.queryByText("Private route")).not.toBeInTheDocument();
  });

  it("allows an explicit local fallback without duplicating route auth logic", async () => {
    const enableLocalMode = vi.fn();
    render(
      <AuthContext.Provider value={{ ...baseAuth, enableLocalMode }}>
        <AuthenticationBoundary configured><div>Private route</div></AuthenticationBoundary>
      </AuthContext.Provider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Proceed in Offline Local Mode" }));
    expect(enableLocalMode).toHaveBeenCalledOnce();
  });

  it("renders routes for authenticated users", () => {
    render(
      <AuthContext.Provider value={{ ...baseAuth, user: { id: "user-1" } as never }}>
        <AuthenticationBoundary configured><div>Private route</div></AuthenticationBoundary>
      </AuthContext.Provider>,
    );
    expect(screen.getByText("Private route")).toBeInTheDocument();
  });
});
