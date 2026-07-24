import React from "react";
import type { PersonInsight } from "../types";

interface InsightsPanelProps {
  insights: PersonInsight[];
  onStatusChange?: (insightId: string, status: PersonInsight["status"]) => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, onStatusChange }) => {
  return (
    <div className="qilife-card people-insights-panel" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em" }}>Evidence-Backed Insights</h4>
          <span style={{ fontSize: "10px", background: "rgba(96, 165, 250, 0.15)", color: "#60a5fa", padding: "2px 6px", borderRadius: "4px" }}>
            Derived
          </span>
        </div>
        <span style={{ fontSize: "11px", color: "var(--qi-faint, #666)" }}>{insights.length} Total</span>
      </div>

      {insights.length === 0 ? (
        <div style={{ color: "var(--qi-faint, #666)", fontSize: "12px", fontStyle: "italic" }}>
          No active derived insights for this relationship.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {insights.map((ins) => (
            <div
              key={ins.id}
              style={{
                background: "rgba(96, 165, 250, 0.04)",
                border: "1px solid rgba(96, 165, 250, 0.2)",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 650, fontSize: "12px", color: "var(--qi-text, #fff)" }}>
                  💡 {ins.statement}
                </div>
                {ins.confidence && (
                  <span style={{ fontSize: "10px", color: "var(--qi-muted, #888)" }}>
                    {Math.round(ins.confidence * 100)}% Confidence
                  </span>
                )}
              </div>

              {ins.evidence && ins.evidence.length > 0 && (
                <div style={{ background: "rgba(0, 0, 0, 0.2)", padding: "6px 8px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "10px", color: "#60a5fa", fontWeight: 600, marginBottom: "4px" }}>
                    SUPPORTING EVIDENCE:
                  </div>
                  {ins.evidence.map((ev, idx) => (
                    <div key={idx} style={{ fontSize: "11px", color: "var(--qi-muted, #aaa)", display: "flex", gap: "6px" }}>
                      <span>•</span>
                      <span>{ev.description} {ev.timestamp && `(${new Date(ev.timestamp).toLocaleDateString()})`}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => onStatusChange && onStatusChange(ins.id, "confirmed")}
                  style={{
                    background: ins.status === "confirmed" ? "#10b981" : "rgba(255, 255, 255, 0.05)",
                    color: ins.status === "confirmed" ? "#000" : "#aaa",
                    border: "1px solid #444",
                    borderRadius: "4px",
                    fontSize: "10px",
                    padding: "3px 8px",
                    cursor: "pointer",
                  }}
                >
                  {ins.status === "confirmed" ? "✓ Confirmed" : "Confirm"}
                </button>

                <button
                  type="button"
                  onClick={() => onStatusChange && onStatusChange(ins.id, "dismissed")}
                  style={{
                    background: ins.status === "dismissed" ? "#ef4444" : "rgba(255, 255, 255, 0.05)",
                    color: ins.status === "dismissed" ? "#fff" : "#aaa",
                    border: "1px solid #444",
                    borderRadius: "4px",
                    fontSize: "10px",
                    padding: "3px 8px",
                    cursor: "pointer",
                  }}
                >
                  {ins.status === "dismissed" ? "Dismissed" : "Dismiss"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
