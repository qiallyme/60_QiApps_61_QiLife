import { useEffect } from "react";
import { entityRegistry } from "../data/entityRegistry";
import type { QiWorkspaceDefinition } from "../data/workspaceRegistry";
import type { QiRecord } from "../types";
import { EntityPage } from "./EntityPage";

interface WorkspacePageProps {
  workspace: QiWorkspaceDefinition;
  activeEntityKey: string;
  refreshToken: number;
  autoEditRecord?: QiRecord | null;
  onSelectEntity: (entityKey: string) => void;
  onClearAutoEdit: () => void;
}

export function WorkspacePage({
  workspace,
  activeEntityKey,
  refreshToken,
  autoEditRecord,
  onSelectEntity,
  onClearAutoEdit
}: WorkspacePageProps) {
  const validTab = workspace.tabs.find((tab) => tab.entityKey === activeEntityKey);
  const selectedTab = validTab || workspace.tabs[0];
  const entity = entityRegistry[selectedTab.entityKey];

  useEffect(() => {
    if (!validTab) onSelectEntity(workspace.tabs[0].entityKey);
  }, [validTab, workspace.tabs, onSelectEntity]);

  return (
    <div className="qilife-workspace">
      <header className="qilife-workspace-header">
        <div>
          <div className="qilife-eyebrow">{workspace.eyebrow}</div>
          <h2><span className="qilife-title-icon">{workspace.icon}</span>{workspace.label}</h2>
          <p>{workspace.description}</p>
        </div>
      </header>

      <nav className="qilife-workspace-tabs" aria-label={`${workspace.label} views`}>
        {workspace.tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.entityKey === selectedTab.entityKey ? "active" : ""}
            onClick={() => onSelectEntity(tab.entityKey)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <EntityPage
        entity={entity}
        refreshToken={refreshToken}
        autoEditRecord={autoEditRecord}
        onClearAutoEdit={onClearAutoEdit}
        embedded
      />
    </div>
  );
}
