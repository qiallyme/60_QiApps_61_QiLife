import { useContext, useEffect, useState } from "react";
import { hasSupabaseConfig } from "../../../lib/supabaseClient";
import { AuthContext, type AuthContextType } from "../auth/AuthProvider";
import { listAllRecords } from "../services/qilifeStore";
import { RecoveryPanel } from "./RecoveryPanel";
import {
  getStorageStatus,
  initializeStorageStatus,
  reportStorageFailure,
  setStorageStatus,
  useStorageStatus,
} from "./storageStatus";

const labels = {
  cloud: "Cloud",
  local: "Local",
  offline: "Offline",
  sync_error: "Sync error",
} as const;

export function StorageStatusIndicator() {
  const auth = useContext(AuthContext);
  if (!auth) return null;
  return <StorageStatusIndicatorContent auth={auth} />;
}

function StorageStatusIndicatorContent({ auth }: { auth: AuthContextType }) {
  const { user, localMode } = auth;
  const status = useStorageStatus();
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  useEffect(() => {
    initializeStorageStatus({
      configured: hasSupabaseConfig,
      localMode,
      authenticated: Boolean(user),
    });

    async function confirmCloud() {
      if (!user || localMode || !hasSupabaseConfig) return;
      if (!navigator.onLine) {
        setStorageStatus({
          kind: "offline",
          detail: "Cloud account available but currently disconnected",
          lastConfirmedAt: getStorageStatus().lastConfirmedAt,
        });
        return;
      }
      try {
        // An owner-scoped record read proves the authenticated persistence path.
        await listAllRecords();
      } catch (error) {
        reportStorageFailure(error, "read");
      }
    }

    void confirmCloud();
    const handleOnline = () => void confirmCloud();
    const handleOffline = () => setStorageStatus({
      kind: "offline",
      detail: "Cloud account available but currently disconnected",
      lastConfirmedAt: getStorageStatus().lastConfirmedAt,
    });
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [localMode, user]);

  return (
    <>
      <button
        type="button"
        className={`qilife-store-pill storage-${status.kind}`}
        title={`${labels[status.kind]} - ${status.detail}. Open recovery tools.`}
        onClick={() => setRecoveryOpen(true)}
      >
        <strong>{labels[status.kind]}</strong>
        <span>{status.detail}</span>
      </button>
      {recoveryOpen && <RecoveryPanel onClose={() => setRecoveryOpen(false)} />}
    </>
  );
}
