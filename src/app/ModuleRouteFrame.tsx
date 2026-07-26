import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { QuickCaptureModal } from "../features/qilife/components/QuickCaptureModal";
import { SidebarNav } from "../features/qilife/components/SidebarNav";
import { StorageStatusIndicator } from "../features/qilife/reliability/StorageStatusIndicator";

export function ModuleRouteFrame({ label, children }: { label: string; children: ReactNode }) {
  const navigate = useNavigate();
  const [captureOpen, setCaptureOpen] = useState(false);

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

  return (
    <div className="qilife-app">
      <header className="qilife-topbar">
        <div className="qilife-topbar-title"><div className="qilife-eyebrow">QILIFE</div><div className="qilife-topbar-page-title">{label}</div></div>
        <button className="qilife-capture-bar" type="button" onClick={() => setCaptureOpen(true)}>
          <span>＋</span><strong>Capture anything</strong><kbd>Ctrl K</kbd>
        </button>
        <div className="qilife-topbar-actions">
          <button className="qilife-mini-btn" type="button" onClick={() => navigate("/journal/new")}>Quick journal</button>
          <StorageStatusIndicator />
        </div>
      </header>
      <div className="qilife-body">
        <SidebarNav
          activeWorkspaceKey={null}
          activeViewKey={null}
          moduleNavigation={[]}
          onSelectWorkspace={() => undefined}
          onSelectView={() => navigate("/")}
          onHome={() => navigate("/")}
        />
        <div className="qilife-content">{children}</div>
      </div>
      {captureOpen && <QuickCaptureModal onClose={() => setCaptureOpen(false)} onSaved={() => setCaptureOpen(false)} />}
    </div>
  );
}
