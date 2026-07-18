import { navGroups, type QiSpecialViewKey } from "../data/navRegistry";
import type { QiWorkspaceKey } from "../data/workspaceRegistry";

interface SidebarNavProps {
  activeWorkspaceKey: QiWorkspaceKey | null;
  activeViewKey: QiSpecialViewKey | null;
  onSelectWorkspace: (workspaceKey: QiWorkspaceKey) => void;
  onSelectView: (viewKey: QiSpecialViewKey) => void;
  onHome: () => void;
}

export function SidebarNav({
  activeWorkspaceKey,
  activeViewKey,
  onSelectWorkspace,
  onSelectView,
  onHome
}: SidebarNavProps) {
  return (
    <aside className="qilife-sidebar">
      <button className="qilife-brand" type="button" onClick={onHome}>
        <div className="qilife-brand-mark">◐</div>
        <div>
          <div className="qilife-brand-title">QiLife</div>
          <div className="qilife-brand-subtitle">Life OS</div>
        </div>
      </button>

      <button
        className={`qilife-assistant-button ${activeViewKey === "assistant" ? "active" : ""}`}
        type="button"
        onClick={() => onSelectView("assistant")}
      >
        <span>✦</span>
        <div>
          <strong>Ask QiLife</strong>
          <small>Search, orient, act</small>
        </div>
      </button>

      <nav className="qilife-nav" aria-label="QiLife navigation">
        {navGroups.map((group) => (
          <section key={group.id} className="qilife-nav-group">
            {group.label && <div className="qilife-nav-group-label">{group.label}</div>}

            {group.items.map((item) => {
              const active = item.home
                ? !activeWorkspaceKey && !activeViewKey
                : item.workspaceKey === activeWorkspaceKey && !activeViewKey;

              return (
                <button
                  key={item.id}
                  className={`qilife-nav-item ${active ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    if (item.home) onHome();
                    else if (item.workspaceKey) onSelectWorkspace(item.workspaceKey);
                  }}
                >
                  <span className="qilife-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </section>
        ))}
      </nav>
    </aside>
  );
}
