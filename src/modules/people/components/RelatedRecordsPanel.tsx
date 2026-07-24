import React from "react";
import type { RelatedRecordReference } from "../types";

interface RelatedRecordsPanelProps {
  records: RelatedRecordReference[];
}

export const RelatedRecordsPanel: React.FC<RelatedRecordsPanelProps> = ({ records }) => {
  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "journal": return "📓";
      case "task": return "✅";
      case "project": return "🗂️";
      case "thread": return "💬";
      case "document": return "📄";
      case "financial": return "💰";
      default: return "🔗";
    }
  };

  return (
    <div className="qilife-card people-related-records" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em" }}>Related QiLife Records</h4>
        <span style={{ fontSize: "11px", color: "var(--qi-faint, #666)" }}>{records.length} Linked</span>
      </div>

      {records.length === 0 ? (
        <div style={{ color: "var(--qi-faint, #666)", fontSize: "12px", fontStyle: "italic" }}>
          No cross-module records linked yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {records.map((rec) => (
            <div
              key={rec.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--qi-border, rgba(255, 255, 255, 0.08))",
                padding: "8px 10px",
                borderRadius: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px" }}>{getEntityIcon(rec.entityType)}</span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--qi-text, #fff)" }}>
                    {rec.title}
                  </div>
                  {rec.summary && (
                    <div style={{ fontSize: "11px", color: "var(--qi-muted, #aaa)" }}>{rec.summary}</div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "10px", color: "var(--qi-faint, #666)", textTransform: "capitalize" }}>
                  {rec.relationshipType.replace("_", " ")}
                </span>
                <div style={{ fontSize: "10px", color: "var(--qi-faint, #555)" }}>
                  {new Date(rec.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
