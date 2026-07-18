import { entityRegistry } from "../data/entityRegistry";
import { navGroups, type QiSpecialViewKey } from "../data/navRegistry";

interface SidebarNavProps {
  activeEntityKey: string | null;
  activeViewKey: QiSpecialViewKey | null;
  onSelectEntity: (entityKey: string) => void;
  onSelectView: (viewKey: QiSpecialViewKey) => void;
  onHome: () => void;
}

export function SidebarNav({
  activeEntityKey,
  activeViewKey,
  onSelectEntity,
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

      <nav className="qilife-nav" aria-label="QiLife navigation">
        {navGroups.map((group) => (
          <section key={group.id} className="qilife-nav-group">
            {group.label && <div className="qilife-nav-group-label">{group.label}</div>}

            {group.items.map((item) => {
              const entity = item.entityKey ? entityRegistry[item.entityKey] : null;
              const active = item.viewKey
                ? item.viewKey === activeViewKey
                : item.entityKey
                  ? item.entityKey === activeEntityKey && !activeViewKey
                  : !activeEntityKey && !activeViewKey;

              return (
                <button
                  key={item.id}
                  className={`qilife-nav-item ${active ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    if (item.viewKey) onSelectView(item.viewKey);
                    else if (item.entityKey) onSelectEntity(item.entityKey);
                    else onHome();
                  }}
                >
                  <span className="qilife-nav-icon">
                    {item.viewKey === "assistant" ? "✦" : entity?.icon || "⌂"}
                  </span>
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
