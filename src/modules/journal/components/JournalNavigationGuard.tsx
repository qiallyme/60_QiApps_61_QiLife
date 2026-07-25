import { useBlocker } from "react-router-dom";

export function JournalNavigationGuard({
  active,
  failed,
  message,
  onRetry,
}: {
  active: boolean;
  failed: boolean;
  message?: string;
  onRetry: () => void;
}) {
  const blocker = useBlocker(active);

  if (blocker.state !== "blocked") return null;

  return (
    <div
      aria-label="Unsaved journal changes"
      aria-modal="true"
      className="qilife-modal-backdrop"
      role="dialog"
    >
      <div className="qilife-modal">
        <h2>Unsaved journal changes</h2>
        <p>
          {failed
            ? "The latest save failed. Your current-session draft is still open."
            : message ?? "A Journal save is still pending."}
        </p>
        <div className="qilife-actions end">
          <button type="button" onClick={() => blocker.reset()}>Stay</button>
          {failed && <button type="button" onClick={onRetry}>Retry save</button>}
          <button className="qilife-btn danger" type="button" onClick={() => blocker.proceed()}>
            Leave anyway
          </button>
        </div>
      </div>
    </div>
  );
}
