import { useContext } from "react";
import { AuthContext } from "./auth/AuthProvider";
import { StorageStatusIndicator } from "../reliability/StorageStatusIndicator";

interface TopbarProps {
  activeLabel: string;
  userEmail?: string;
  onQuickCapture: () => void;
  onQuickJournal?: () => void;
  onToggleMobileNav?: () => void;
}

export function Topbar({
  activeLabel,
  userEmail: propUserEmail,
  onQuickCapture,
  onQuickJournal,
  onToggleMobileNav,
}: TopbarProps) {
  const auth = useContext(AuthContext);
  const signOut = auth?.signOut;
  const userEmail = propUserEmail ?? auth?.user?.email;

  return (
    <header className="qilife-topbar">
      <div className="qilife-topbar-left">
        {onToggleMobileNav && (
          <button
            className="qilife-mobile-toggle"
            type="button"
            aria-label="Toggle navigation menu"
            onClick={onToggleMobileNav}
          >
            ☰
          </button>
        )}
        <div className="qilife-topbar-title">
          <div className="qilife-eyebrow">QILIFE</div>
          <div className="qilife-topbar-page-title">{activeLabel}</div>
        </div>
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
        {userEmail && signOut && (
          <button className="qilife-mini-btn" type="button" onClick={() => signOut().catch(console.error)}>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
