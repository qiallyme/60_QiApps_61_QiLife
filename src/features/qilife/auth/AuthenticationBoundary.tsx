import type { ReactNode } from "react";
import { hasSupabaseConfig } from "../../../lib/supabaseClient";
import { LoginPage } from "./LoginPage";
import { useAuth } from "./useAuth";

export function AuthenticationBoundary({
  children,
  configured = hasSupabaseConfig,
}: {
  children: ReactNode;
  configured?: boolean;
}) {
  const { user, loading, localMode, enableLocalMode } = useAuth();
  if (loading) {
    return <div className="qilife-app centered"><div className="qilife-empty">Connecting to QiLife…</div></div>;
  }
  if (configured && !user && !localMode) {
    return <LoginPage showBypass onBypassLocal={enableLocalMode} />;
  }
  return children;
}
