import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  ["Today", "/"],
  ["Timeline", "/timeline"],
  ["Inbox", "/inbox"],
  ["Threads", "/threads"],
  ["Actions", "/actions"],
  ["Calendar", "/calendar"],
  ["People", "/people"],
  ["Money", "/money"],
  ["Knowledge", "/knowledge"],
  ["Documents", "/documents"],
  ["Ask QiLife", "/ask"],
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
        <div className="brand-block">
          <span className="brand-kicker">QiLife</span>
          <h1>Personal LifeDesk</h1>
          <p>QiBits, timeline, threads, actions, and context in one local-first desk.</p>
        </div>

        <nav className="nav-stack" aria-label="Primary">
          {navItems.map(([label, href]) => (
            <NavLink
              key={href}
              className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
              to={href}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="rail-note">
          <h2>Doctrine</h2>
          <ul>
            <li>QiBit is atomic.</li>
            <li>Timeline is the spine.</li>
            <li>Context Dock embeds knowledge.</li>
          </ul>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-topbar">
          <div>
            <span className="topbar-label">QiLife v1 Spine</span>
            <strong>Local-first build in progress</strong>
          </div>
        </header>
        <section className="workspace-content">{children}</section>
      </main>

      <aside className="right-dock">{contextDock}</aside>

      <div className="quick-capture-bar">{quickCapture}</div>
    </div>
  );
}
