import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { moduleRegistry } from "../../../app/moduleRegistry";
import { seedDemoData, isSupabaseConfigured } from "../services/qilifeStore";
import { HomeDashboard } from "./HomeDashboard";
import { QuickCaptureModal } from "./QuickCaptureModal";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { AssistantPage } from "./AssistantPage";
import { WorkspacePage } from "./WorkspacePage";
import { useAuth } from "../auth/useAuth";
import type { QiRecord } from "../types";
import type { QiSpecialViewKey } from "../data/navRegistry";
import {
  workspaceForEntity,
  workspaceRegistry,
  type QiWorkspaceKey
} from "../data/workspaceRegistry";

export function QiLifeShell() {
  const navigate = useNavigate();
  const { user, loading, localMode } = useAuth();
  const [activeWorkspaceKey, setActiveWorkspaceKey] = useState<QiWorkspaceKey | null>(null);
  const [activeEntityKey, setActiveEntityKey] = useState("task");
  const [activeViewKey, setActiveViewKey] = useState<QiSpecialViewKey | null>(null);
  const [autoEditRecord, setAutoEditRecord] = useState<QiRecord | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [booted, setBooted] = useState(false);

  const isConfigured = isSupabaseConfigured();
  useEffect(() => {
    setBooted(false);
    const isLocal = !isConfigured || localMode || !user;
    if (isLocal) {
      seedDemoData().catch(console.warn).finally(() => setBooted(true));
    } else setBooted(true);
  }, [isConfigured, user, localMode]);

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
    if (entityKey === "journal_entry" && record) {
      navigate(`/journal/${record.id}`);
      return;
    }
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
  const activeLabel = activeViewKey === "assistant"
    ? "Ask QiLife"
    : activeWorkspaceKey
      ? workspaceRegistry[activeWorkspaceKey].label
      : "Home";

  return (
    <div className="qilife-app">
      <Topbar
        activeLabel={activeLabel}
        userEmail={user?.email}
        onQuickCapture={() => setCaptureOpen(true)}
        onQuickJournal={() => navigate("/journal/new")}
      />
      <div className="qilife-body">
        <SidebarNav
          activeWorkspaceKey={activeWorkspaceKey}
          activeViewKey={activeViewKey}
          moduleNavigation={moduleRegistry.navigation}
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
              moduleWidgets={moduleRegistry.widgets}
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
