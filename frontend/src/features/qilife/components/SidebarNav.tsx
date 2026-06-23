// src/features/qilife/components/SidebarNav.tsx

import { navGroups } from "../data/navRegistry";

interface SidebarNavProps {
  activeEntityKey: string | null;
  onSelectEntity: (key: string) => void;
  onHome: () => void;
}

export function SidebarNav({ activeEntityKey, onSelectEntity, onHome }: SidebarNavProps) {
  return (
    <aside className="qi-sidebar">
      <button className="qi-brand" onClick={onHome} type="button" style={{ border: "none" }}>
        <div className="qi-brand-mark">◐</div>
        <div>
          <div className="qi-brand-name">QiLife</div>
          <div className="qi-brand-tagline">Life Command</div>
        </div>
      </button>

      <nav className="qi-nav">
        {navGroups.map((group) => (
          <div key={group.id} className="qi-nav-group">
            {group.label && (
              <div className="qi-nav-group-label">{group.label}</div>
            )}
            {group.items.map((item) => {
              const isActive =
                item.entityKey === activeEntityKey ||
                (!item.entityKey && activeEntityKey === null);

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`qi-nav-item ${isActive ? "active" : ""}`}
                  onClick={() =>
                    item.entityKey ? onSelectEntity(item.entityKey) : onHome()
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
