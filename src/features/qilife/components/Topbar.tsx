import { useAuth } from "../auth/useAuth";
import { StorageStatusIndicator } from "../reliability/StorageStatusIndicator";

interface TopbarProps {
  activeLabel: string;
  userEmail?: string;
  onQuickCapture: () => void;
  onQuickJournal?: () => void;
}

export function Topbar({
  activeLabel,
  userEmail,
  onQuickCapture,
  onQuickJournal,
}: TopbarProps) {
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
        {onQuickJournal && (
          <button className="qilife-mini-btn" type="button" onClick={onQuickJournal}>
            Quick journal
          </button>
        )}
        <StorageStatusIndicator />
        {userEmail && (
          <button className="qilife-mini-btn" type="button" onClick={() => signOut().catch(console.error)}>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
