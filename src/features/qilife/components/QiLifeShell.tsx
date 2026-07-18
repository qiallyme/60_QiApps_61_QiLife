import { useCallback, useEffect, useState } from "react";
import { getStoreMode, seedDemoData, isSupabaseConfigured } from "../services/qilifeStore";
import { HomeDashboard } from "./HomeDashboard";
import { QuickCaptureModal } from "./QuickCaptureModal";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { AssistantPage } from "./AssistantPage";
import { WorkspacePage } from "./WorkspacePage";
import { useAuth } from "../auth/useAuth";
import { LoginPage } from "../auth/LoginPage";
import type { QiRecord } from "../types";
import type { QiSpecialViewKey } from "../data/navRegistry";
import {
  workspaceForEntity,
  workspaceRegistry,
  type QiWorkspaceKey
} from "../data/workspaceRegistry";

export function QiLifeShell() {
  const { user, loading } = useAuth();
  const [localBypass, setLocalBypass] = useState(false);
  const [activeWorkspaceKey, setActiveWorkspaceKey] = useState<QiWorkspaceKey | null>(null);
  const [activeEntityKey, setActiveEntityKey] = useState("task");
  const [activeViewKey, setActiveViewKey] = useState<QiSpecialViewKey | null>(null);
  const [autoEditRecord, setAutoEditRecord] = useState<QiRecord | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [booted, setBooted] = useState(false);

  const isConfigured = isSupabaseConfigured();
  const showLogin = isConfigured && !user && !localBypass;

  useEffect(() => {
    setBooted(false);
    const isLocal = !isConfigured || localBypass || !user;
    if (isLocal) {
      seedDemoData().catch(console.warn).finally(() => setBooted(true));
    } else setBooted(true);
  }, [isConfigured, user, localBypass]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCaptureOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectEntity = useCallback((entityKey: string) => {
    setActiveEntityKey(entityKey);
  }, []);

  function handleOpenEntity(entityKey: string, record?: QiRecord) {
    setActiveViewKey(null);
    setActiveWorkspaceKey(workspaceForEntity(entityKey));
    setActiveEntityKey(entityKey);
    if (record) setAutoEditRecord(record);
  }

  function handleOpenWorkspace(workspaceKey: QiWorkspaceKey) {
    setActiveViewKey(null);
    setActiveWorkspaceKey(workspaceKey);
    setActiveEntityKey(workspaceRegistry[workspaceKey].tabs[0].entityKey);
    setAutoEditRecord(null);
  }

  function handleOpenView(viewKey: QiSpecialViewKey) {
    setActiveWorkspaceKey(null);
    setAutoEditRecord(null);
    setActiveViewKey(viewKey);
  }

  function handleHome() {
    setActiveWorkspaceKey(null);
    setActiveViewKey(null);
    setAutoEditRecord(null);
  }

  if (loading) return <div className="qilife-app centered"><div className="qilife-empty">Connecting to QiLife...</div></div>;
  if (showLogin) return <LoginPage showBypass onBypassLocal={() => setLocalBypass(true)} />;

  const storeMode = getStoreMode(!!user && !localBypass);
  const activeLabel = activeViewKey === "assistant"
    ? "Ask QiLife"
    : activeWorkspaceKey
      ? workspaceRegistry[activeWorkspaceKey].label
      : "Home";

  return (
    <div className="qilife-app">
      <Topbar activeLabel={activeLabel} storeMode={storeMode} userEmail={user?.email} onQuickCapture={() => setCaptureOpen(true)} />
      <div className="qilife-body">
        <SidebarNav
          activeWorkspaceKey={activeWorkspaceKey}
          activeViewKey={activeViewKey}
          onSelectWorkspace={handleOpenWorkspace}
          onSelectView={handleOpenView}
          onHome={handleHome}
        />
        <main className="qilife-content">
          {!booted ? (
            <div className="qilife-page"><div className="qilife-empty">Booting QiLife...</div></div>
          ) : activeViewKey === "assistant" ? (
            <AssistantPage onOpenEntity={handleOpenEntity} refreshToken={refreshToken} />
          ) : activeWorkspaceKey ? (
            <WorkspacePage
              workspace={workspaceRegistry[activeWorkspaceKey]}
              activeEntityKey={activeEntityKey}
              refreshToken={refreshToken}
              autoEditRecord={autoEditRecord}
              onSelectEntity={handleSelectEntity}
              onClearAutoEdit={() => setAutoEditRecord(null)}
            />
          ) : (
            <HomeDashboard
              onOpenEntity={handleOpenEntity}
              onOpenWorkspace={handleOpenWorkspace}
              onOpenAssistant={() => handleOpenView("assistant")}
              refreshToken={refreshToken}
            />
          )}
        </main>
      </div>
      {captureOpen && (
        <QuickCaptureModal
          onClose={() => setCaptureOpen(false)}
          onSaved={() => {
            setRefreshToken((value) => value + 1);
            setCaptureOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default QiLifeShell;
