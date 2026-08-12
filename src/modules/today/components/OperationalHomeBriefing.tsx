import { useState } from "react";
import type { CandidateAction, OpenLoop, QiBit } from "../../../features/qilife/types";

interface OperationalHomeBriefingProps {
  whatChanged?: QiBit[];
  whatNeedsAttention?: OpenLoop[];
  whatIsWaiting?: OpenLoop[];
  whatIsBlocked?: OpenLoop[];
  recommendedActions?: CandidateAction[];
  onAuthorizeAction?: (actionId: string) => void;
}

export function OperationalHomeBriefing({
  whatChanged = [],
  whatNeedsAttention = [],
  whatIsWaiting = [],
  whatIsBlocked = [],
  recommendedActions = [],
  onAuthorizeAction,
}: OperationalHomeBriefingProps) {
  const [authorizedIds, setAuthorizedIds] = useState<Set<string>>(new Set());

  const handleConfirm = (id: string) => {
    setAuthorizedIds((prev) => new Set(prev).add(id));
    if (onAuthorizeAction) onAuthorizeAction(id);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
          Operational State Briefing
        </h1>
        <p style={{ color: "#4b5563", fontSize: "0.95rem" }}>
          Continuous operational awareness across your life, work, and open loops.
        </p>
      </header>

      {/* Grid of Operational Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Recommended Next Action */}
        <section style={{ gridColumn: "1 / -1", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#166534", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⚡</span> Recommended Next Action
          </h2>
          {recommendedActions.length === 0 ? (
            <p style={{ color: "#15803d", fontSize: "0.9rem" }}>No pending candidate actions requiring authorization.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recommendedActions.map((action) => {
                const isDone = authorizedIds.has(action.id);
                return (
                  <div key={action.id} style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid #dcfce7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "600", color: "#111827" }}>{action.title}</div>
                      <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{action.description}</div>
                      {action.consequential && (
                        <span style={{ display: "inline-block", marginTop: "0.25rem", fontSize: "0.75rem", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "4px" }}>
                          Requires Confirmation
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleConfirm(action.id)}
                      disabled={isDone}
                      style={{
                        background: isDone ? "#9ca3af" : "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        fontWeight: "500",
                        cursor: isDone ? "default" : "pointer",
                      }}
                    >
                      {isDone ? "Authorized" : "Authorize & Act"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* What Needs Attention */}
        <section style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🎯</span> What Needs Attention
          </h2>
          {whatNeedsAttention.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Everything is up to date.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {whatNeedsAttention.map((item) => (
                <li key={item.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6", fontSize: "0.9rem", color: "#374151" }}>
                  {item.summary}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* What is Waiting */}
        <section style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⏳</span> What Am I Waiting On?
          </h2>
          {whatIsWaiting.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>No active waiting items.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {whatIsWaiting.map((item) => (
                <li key={item.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6", fontSize: "0.9rem", color: "#374151" }}>
                  {item.summary}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* What is Blocked */}
        <section style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#991b1b", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🚫</span> What Is Blocked?
          </h2>
          {whatIsBlocked.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>No active blockers.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {whatIsBlocked.map((item) => (
                <li key={item.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #fee2e2", color: "#991b1b", fontSize: "0.9rem" }}>
                  {item.summary}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* What Changed */}
        <section style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🔄</span> What Changed Recently?
          </h2>
          {whatChanged.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>No recent activity.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {whatChanged.map((bit) => (
                <li key={bit.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6", fontSize: "0.9rem", color: "#374151" }}>
                  <strong>[{bit.type}]</strong> {bit.title}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
