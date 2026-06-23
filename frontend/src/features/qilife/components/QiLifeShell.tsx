// src/features/qilife/components/QiLifeShell.tsx

import { useState } from "react";
import { entityRegistry } from "../data/entityRegistry";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { HomeDashboard } from "./HomeDashboard";
import { EntityPage } from "./EntityPage";
import { QuickCaptureModal } from "./QuickCaptureModal";
import "../styles/qilife.css";

export function QiLifeShell() {
  const [activeEntityKey, setActiveEntityKey] = useState<string | null>(null);
  const [captureOpen, setCaptureOpen]         = useState(false);
  const [capturePreset, setCapturePreset]     = useState<string>("task");

  const activeEntity = activeEntityKey ? entityRegistry[activeEntityKey] : null;

  function handleCapture(preset?: string) {
    if (preset) setCapturePreset(preset);
    setCaptureOpen(true);
  }

  return (
    <div className="qi-app">
      <Topbar
        pageTitle={activeEntity?.plural ?? "Home"}
        onCapture={() => handleCapture(activeEntityKey ?? "task")}
      />

      <div className="qi-body">
        <SidebarNav
          activeEntityKey={activeEntityKey}
          onSelectEntity={setActiveEntityKey}
          onHome={() => setActiveEntityKey(null)}
        />

        <main className="qi-content">
          {activeEntity ? (
            <EntityPage
              entity={activeEntity}
              onCapture={() => handleCapture(activeEntity.key)}
            />
          ) : (
            <HomeDashboard onOpenEntity={setActiveEntityKey} />
          )}
        </main>
      </div>

      {captureOpen && (
        <QuickCaptureModal
          defaultEntityKey={capturePreset}
          onClose={() => setCaptureOpen(false)}
        />
      )}
    </div>
  );
}
