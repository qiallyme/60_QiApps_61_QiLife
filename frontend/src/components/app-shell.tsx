import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  CheckSquare,
  History,
  Inbox,
  Menu,
  PlusCircle,
  Sun,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Today", href: "/", icon: <Sun size={18} /> },
  { label: "Knowledge", href: "/knowledge", icon: <BookOpen size={18} /> },
  { label: "Capture", href: "/capture", icon: <PlusCircle size={18} /> },
  { label: "Review", href: "/review", icon: <CheckSquare size={18} /> },
  { label: "Timeline", href: "/timeline", icon: <History size={18} /> },
  { label: "Actions", href: "/actions", icon: <CheckCircle size={18} /> },
  { label: "Inbox", href: "/inbox", icon: <Inbox size={18} /> },
  { label: "People", href: "/people", icon: <Users size={18} /> },
  { label: "More", href: "/more", icon: <Menu size={18} /> },
] as const;

const mobileNavItems = [
  { label: "Today", href: "/", icon: <Sun size={20} /> },
  { label: "Capture", href: "/capture", icon: <PlusCircle size={20} /> },
  { label: "Review", href: "/review", icon: <CheckSquare size={20} /> },
  { label: "Actions", href: "/actions", icon: <CheckCircle size={20} /> },
  { label: "More", href: "/more", icon: <Menu size={20} /> },
];

type AppShellProps = {
  children: ReactNode;
  contextDock: ReactNode;
  quickCapture: ReactNode;
  backendStatus?: "checking" | "online" | "offline";
};

function statusLabel(status: "checking" | "online" | "offline") {
  if (status === "online") return "Backend connected";
  if (status === "offline") return "Local fallback mode";
  return "Checking backend";
}

export function AppShell({ children, contextDock, quickCapture, backendStatus = "checking" }: AppShellProps) {
  const location = useLocation();
  const isCaptureRoute = location.pathname === "/capture";

  return (
    <div className="shell">
      <header className="mobile-header">
        <h1>QiLife</h1>
        <span className="mobile-mock-badge">{statusLabel(backendStatus)}</span>
      </header>

      <aside className="left-rail">
        <div className="rail-logo">
          <div className="rail-logo-kicker">AI LifeDesk</div>
          <h1>QiLife</h1>
          <p>{statusLabel(backendStatus)}</p>
        </div>

        <nav className="rail-nav" aria-label="Primary navigation">
          {navItems.map(({ label, href, icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/"}
              className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {!isCaptureRoute ? <div className="rail-capture">{quickCapture}</div> : null}
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <span className="workspace-breadcrumb">QiLife Command Desk</span>
          <span className="workspace-status-dot">
            <span className="status-dot" />
            {statusLabel(backendStatus)}
          </span>
        </header>
        {children}
      </main>

      <aside className="right-dock-wrap">{contextDock}</aside>

      <nav className="mobile-nav">
        {mobileNavItems.map(({ label, href, icon }) => {
          const isActive = location.pathname === href;
          return (
            <NavLink key={href} to={href} end={href === "/"} className={`mobile-nav-item ${isActive ? "active" : ""}`}>
              <span className="mobile-nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
