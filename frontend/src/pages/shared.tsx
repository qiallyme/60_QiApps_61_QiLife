// ─── Status Badge ─────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cls = `badge badge-${status.replace(/_/g, "_")}`;
  return <span className={cls}>{status.replace(/_/g, " ")}</span>;
}

// ─── Priority Badge ───────────────────────────────────────────────
export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "normal") return null;
  return <span className={`badge badge-${priority}`}>{priority}</span>;
}

// ─── State: Loading ───────────────────────────────────────────────
export function StateLoading() {
  return (
    <div className="state-loading">
      <span className="spinner" />
      Loading…
    </div>
  );
}

// ─── State: Error ─────────────────────────────────────────────────
export function StateError({ message }: { message: string }) {
  return <div className="error-banner">{message}</div>;
}

// ─── State: Empty ─────────────────────────────────────────────────
export function StateEmpty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="state-empty">
      <div className="state-empty-icon">{icon}</div>
      <div>{text}</div>
    </div>
  );
}
