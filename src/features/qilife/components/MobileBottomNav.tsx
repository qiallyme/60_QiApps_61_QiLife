import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, FolderKanban, Menu, Sun, Users, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const primary = [
  { label: "Today", to: "/today", Icon: Sun },
  { label: "Actions", to: "/actions", Icon: CheckCircle2 },
  { label: "Projects", to: "/projects", Icon: FolderKanban },
  { label: "People", to: "/people", Icon: Users },
  { label: "Journal", to: "/journal", Icon: BookOpen },
];

const more = [
  ["Inbox", "/inbox"],
  ["Calendar", "/calendar"],
  ["Threads", "/threads"],
  ["Software & Services", "/software"],
  ["Timeline", "/timeline"],
  ["Documents", "/documents"],
  ["Knowledge", "/knowledge"],
  ["Decisions", "/decisions"],
  ["Reports", "/reports"],
  ["Apps", "/apps"],
  ["Automations", "/automations"],
  ["Settings", "/settings"],
] as const;

export function MobileBottomNav() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <nav className="qilife-mobile-bottom-nav" aria-label="Primary">
        {primary.map(({ label, to, Icon }) => (
          <NavLink key={to} to={to}>
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button ref={triggerRef} type="button" aria-label="More" onClick={() => setOpen(true)}>
          <Menu aria-hidden="true" size={20} />
          <span>More</span>
        </button>
      </nav>
      {open && (
        <div className="qilife-sheet-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}>
          <section
            className="qilife-more-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="More QiLife destinations"
            onKeyDown={(event) => { if (event.key === "Escape") close(); }}
          >
            <header><div><span className="qilife-eyebrow">NAVIGATION</span><h2>More</h2></div><button ref={closeRef} type="button" aria-label="Close More menu" onClick={close}><X aria-hidden="true" /></button></header>
            <nav aria-label="More destinations">
              {more.map(([label, to]) => <NavLink key={to} to={to} onClick={close}>{label}</NavLink>)}
            </nav>
          </section>
        </div>
      )}
    </>
  );
}
