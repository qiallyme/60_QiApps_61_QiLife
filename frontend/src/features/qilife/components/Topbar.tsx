// src/features/qilife/components/Topbar.tsx

interface TopbarProps {
  pageTitle: string;
  onCapture: () => void;
}

export function Topbar({ pageTitle, onCapture }: TopbarProps) {
  return (
    <header className="qi-topbar">
      <div className="qi-topbar-left">
        <span className="qi-eyebrow" style={{ margin: 0, marginRight: 8 }}>QILIFE</span>
        <span className="qi-topbar-title">{pageTitle}</span>
      </div>

      <div className="qi-topbar-right">
        <button className="qi-btn" type="button">
          Search
        </button>
        <button className="qi-btn primary" type="button" onClick={onCapture}>
          + Capture
        </button>
      </div>
    </header>
  );
}
