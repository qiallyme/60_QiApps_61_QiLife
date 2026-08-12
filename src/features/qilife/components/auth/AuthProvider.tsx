import React, { createContext, useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "../../../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { currentInternalDestination, sameOriginAuthRedirect } from "./authReturnPath";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  localMode: boolean;
  enableLocalMode: () => void;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [localMode, setLocalMode] = useState(
    !hasSupabaseConfig || sessionStorage.getItem("qilife.local-mode") === "true",
  );

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to get session:", err);
      setLoading(false);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithMagicLink(email: string) {
    if (!supabase) throw new Error("Supabase is not configured.");
    const redirectTo = sameOriginAuthRedirect(
      window.location.origin,
      currentInternalDestination(window.location),
    );
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });
    if (error) throw error;
  }

  async function signInWithGoogle() {
    if (!supabase) throw new Error("Supabase is not configured.");
    const redirectTo = sameOriginAuthRedirect(
      window.location.origin,
      currentInternalDestination(window.location),
    );
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });
    if (error) throw error;
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }

  function enableLocalMode() {
    sessionStorage.setItem("qilife.local-mode", "true");
    setLocalMode(true);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        localMode,
        enableLocalMode,
        signInWithMagicLink,
        signInWithGoogle,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
