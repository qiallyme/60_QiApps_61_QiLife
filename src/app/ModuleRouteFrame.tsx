import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { QuickCaptureModal } from "../features/qilife/components/QuickCaptureModal";
import { SidebarNav } from "../features/qilife/components/SidebarNav";
import { Topbar } from "../features/qilife/components/Topbar";

export function ModuleRouteFrame({ label, children }: { label: string; children: ReactNode }) {
  const navigate = useNavigate();
  const [captureOpen, setCaptureOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      <Topbar
        activeLabel={label}
        onQuickCapture={() => setCaptureOpen(true)}
        onQuickJournal={() => navigate("/journal/new")}
        onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
      />
      <div className="qilife-body">
        <SidebarNav
          activeWorkspaceKey={null}
          activeViewKey={null}
          moduleNavigation={[]}
          mobileOpen={mobileNavOpen}
          onCloseMobileNav={() => setMobileNavOpen(false)}
          onSelectWorkspace={() => undefined}
          onSelectView={() => {
            setMobileNavOpen(false);
            navigate("/");
          }}
          onHome={() => {
            setMobileNavOpen(false);
            navigate("/");
          }}
        />
        <div className="qilife-content">{children}</div>
      </div>
      {captureOpen && <QuickCaptureModal onClose={() => setCaptureOpen(false)} onSaved={() => setCaptureOpen(false)} />}
    </div>
  );
}
