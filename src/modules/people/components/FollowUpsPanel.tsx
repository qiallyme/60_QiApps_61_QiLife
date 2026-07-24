import React from "react";
import type { FollowUp, Person } from "../types";

interface FollowUpsPanelProps {
  person: Person;
  onUpdateFollowUp?: (followUpId: string, isCompleted: boolean) => void;
}

export const FollowUpsPanel: React.FC<FollowUpsPanelProps> = ({ person, onUpdateFollowUp }) => {
  const followUps = person.relationship.followUps || [];

  return (
    <div className="qilife-card people-followups-panel" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em" }}>Follow-ups & Promises</h4>
        <span style={{ fontSize: "11px", color: "var(--qi-faint, #666)" }}>
          {followUps.filter((f) => !f.isCompleted).length} Open
        </span>
      </div>

      {followUps.length === 0 ? (
        <div style={{ color: "var(--qi-faint, #666)", fontSize: "12px", fontStyle: "italic" }}>
          No follow-up items or promises pending.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {followUps.map((fu) => (
            <div
              key={fu.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: fu.isCompleted ? "rgba(255, 255, 255, 0.01)" : "rgba(192, 132, 252, 0.04)",
                border: "1px solid var(--qi-border, rgba(255, 255, 255, 0.08))",
                padding: "8px 10px",
                borderRadius: "6px",
                opacity: fu.isCompleted ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={fu.isCompleted}
                  onChange={(e) => onUpdateFollowUp && onUpdateFollowUp(fu.id, e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--qi-text, #fff)", textDecoration: fu.isCompleted ? "line-through" : "none" }}>
                    {fu.title}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--qi-muted, #aaa)" }}>
                    {fu.direction === "owed_by_me" ? "Owed by you" : fu.direction === "owed_to_me" ? "Owed to you" : "Mutual promise"}
                    {fu.dueDate && ` • Due: ${fu.dueDate}`}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: fu.isCompleted ? "#333" : fu.direction === "owed_by_me" ? "rgba(234, 179, 8, 0.2)" : "rgba(96, 165, 250, 0.2)",
                  color: fu.isCompleted ? "#aaa" : fu.direction === "owed_by_me" ? "#fde047" : "#93c5fd",
                }}
              >
                {fu.isCompleted ? "Completed" : fu.direction === "owed_by_me" ? "Action Required" : "Waiting"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
