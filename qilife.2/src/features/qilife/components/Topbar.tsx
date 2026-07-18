import { useAuth } from "../auth/useAuth";

interface TopbarProps {
  activeLabel: string;
  storeMode: "supabase" | "localStorage";
  userEmail?: string;
  onQuickCapture: () => void;
}

export function Topbar({ activeLabel, storeMode, userEmail, onQuickCapture }: TopbarProps) {
  const { signOut } = useAuth();

  return (
    <header className="qilife-topbar">
      <div className="qilife-topbar-title">
        <div className="qilife-eyebrow">QILIFE</div>
        <h1>{activeLabel}</h1>
      </div>

      <button className="qilife-capture-bar" type="button" onClick={onQuickCapture}>
        <span>＋</span>
        <strong>Capture anything</strong>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="qilife-topbar-actions">
        <div className={`qilife-store-pill ${storeMode === "supabase" ? "online" : "local"}`} title={userEmail}>
          {storeMode === "supabase" ? "Synced" : "Local"}
        </div>
        {storeMode === "supabase" && userEmail && (
          <button className="qilife-mini-btn" type="button" onClick={() => signOut().catch(console.error)}>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
