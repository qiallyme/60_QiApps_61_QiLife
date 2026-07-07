import type { ReactNode } from "react";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status.replace(/_/g, "_")}`}>{status.replace(/_/g, " ")}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "normal") return null;
  return <span className={`badge badge-${priority}`}>{priority}</span>;
}

export function StateLoading() {
  return (
    <div className="state-loading">
      <span className="spinner" />
      Loading...
    </div>
  );
}

export function StateError({ message }: { message: string }) {
  return <div className="error-banner">{message}</div>;
}

export function StateEmpty({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="state-empty">
      <div className="state-empty-icon">{icon}</div>
      <div>{text}</div>
    </div>
  );
}
