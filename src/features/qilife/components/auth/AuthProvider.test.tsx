import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
  signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("../../../../lib/supabaseClient", () => ({
  hasSupabaseConfig: true,
  supabase: { auth },
}));

import { AuthContext, AuthProvider } from "./AuthProvider";

function MagicLinkProbe() {
  const context = useContext(AuthContext);
  return (
    <button type="button" onClick={() => void context?.signInWithMagicLink("person@example.com")}>
      Sign in
    </button>
  );
}

describe("AuthProvider return destination", () => {
  beforeEach(() => {
    auth.signInWithOtp.mockClear();
    window.history.replaceState({}, "", "/journal/abc?view=raw#section");
  });

  it("passes the complete same-origin internal URL to Supabase", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <MagicLinkProbe />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: "person@example.com",
      options: {
        emailRedirectTo: `${window.location.origin}/journal/abc?view=raw#section`,
      },
    });
  });
});
