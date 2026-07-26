import { NavLink } from "react-router-dom";
import type { NavigationItem } from "../../../app/moduleTypes";
import { homeNavigation, navGroups, type QiSpecialViewKey } from "../data/navRegistry";
import type { QiWorkspaceKey } from "../data/workspaceRegistry";

interface SidebarNavProps {
  activeWorkspaceKey: QiWorkspaceKey | null;
  activeViewKey: QiSpecialViewKey | null;
  moduleNavigation?: readonly NavigationItem[];
  onSelectWorkspace: (workspaceKey: QiWorkspaceKey) => void;
  onSelectView: (viewKey: QiSpecialViewKey) => void;
  onHome: () => void;
}

function DestinationLink({ item }: { item: { id: string; label: string; icon: string; to: string } }) {
  return (
    <NavLink
      end={item.to === "/"}
      className={({ isActive }) => `qilife-nav-item ${isActive ? "active" : ""}`}
      to={item.to}
    >
      <span className="qilife-nav-icon" aria-hidden="true">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );
}

export function SidebarNav({
  activeViewKey,
  onSelectView,
}: SidebarNavProps) {
  return (
    <aside className="qilife-sidebar">
      <NavLink className="qilife-brand" to="/">
        <div className="qilife-brand-mark">◐</div>
        <div>
          <div className="qilife-brand-title">QiLife</div>
          <div className="qilife-brand-subtitle">Life OS</div>
        </div>
      </NavLink>

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
        <section className="qilife-nav-group">
          <DestinationLink item={homeNavigation} />
        </section>
        {navGroups.map((group) => (
          <section key={group.id} className="qilife-nav-group">
            <div className="qilife-nav-group-label">{group.label}</div>
            {group.items.map((item) => <DestinationLink key={item.id} item={item} />)}
          </section>
        ))}
      </nav>
    </aside>
  );
}
