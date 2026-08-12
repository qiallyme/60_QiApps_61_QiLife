import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextType } from "../components/auth/AuthProvider";
import { StorageStatusIndicator } from "./StorageStatusIndicator";

const localAuth = {
  user: null,
  loading: false,
  localMode: true,
  enableLocalMode: vi.fn(),
  signInWithMagicLink: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
} satisfies AuthContextType;

describe("StorageStatusIndicator", () => {
  it("keeps explicit browser-only storage labeled Local when the browser goes offline", () => {
    render(
      <AuthContext.Provider value={localAuth}>
        <StorageStatusIndicator />
      </AuthContext.Provider>,
    );

    expect(screen.getByRole("button", { name: /LocalStored only in this browser/i }))
      .toBeInTheDocument();

    act(() => window.dispatchEvent(new Event("offline")));

    expect(screen.getByRole("button", { name: /LocalStored only in this browser/i }))
      .toBeInTheDocument();
  });
});
