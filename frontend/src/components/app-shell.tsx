import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Today", href: "/", icon: "⊙" },
  { label: "Timeline", href: "/timeline", icon: "◈" },
  { label: "Inbox", href: "/inbox", icon: "⊡" },
  { label: "Threads", href: "/threads", icon: "◎" },
  { label: "Actions", href: "/actions", icon: "◷" },
  { label: "Calendar", href: "/calendar", icon: "◻" },
  { label: "People", href: "/people", icon: "◈" },
  { label: "Money", href: "/money", icon: "◉" },
  { label: "Knowledge", href: "/knowledge", icon: "◆" },
  { label: "Documents", href: "/documents", icon: "◧" },
  { label: "Ask QiLife", href: "/ask", icon: "◐" },
] as const;

type AppShellProps = {
  children: ReactNode;
  contextDock: ReactNode;
  quickCapture: ReactNode;
};

export function AppShell({ children, contextDock, quickCapture }: AppShellProps) {
  return (
    <div className="shell">
      <aside className="left-rail">
        <div className="rail-logo">
          <div className="rail-logo-kicker">Personal LifeDesk</div>
          <h1>QiLife</h1>
          <p>Capture, triage, act, resolve, retrieve.</p>
        </div>

        <nav className="rail-nav" aria-label="Primary navigation">
          <div className="rail-section-label">Core</div>
          {navItems.slice(0, 5).map(({ label, href, icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/"}
              className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
            >
              <span style={{ fontSize: 15, opacity: 0.8 }}>{icon}</span>
              {label}
            </NavLink>
          ))}

          <div className="rail-section-label" style={{ marginTop: 16 }}>Modules</div>
          {navItems.slice(5).map(({ label, href, icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
            >
              <span style={{ fontSize: 15, opacity: 0.8 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="rail-footer">
          QiLife v1 · Local-first build
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <span className="workspace-breadcrumb">QiLife v1 Spine</span>
          <span className="workspace-status-dot">
            <span className="status-dot" />
            API connected
          </span>
        </header>
        {children}
      </main>

      <aside className="right-dock-wrap">{contextDock}</aside>

      <div className="quick-capture-bar">{quickCapture}</div>
    </div>
  );
}
