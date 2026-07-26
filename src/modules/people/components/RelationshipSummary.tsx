import React from "react";
import type { Interaction, Person } from "../types";
import { calculateAttentionPulse } from "../services/relationshipService";

interface RelationshipSummaryProps {
  person: Person;
  interactions?: Interaction[];
}

export const RelationshipSummary: React.FC<RelationshipSummaryProps> = ({ person, interactions = [] }) => {
  const rel = person.relationship;
  const pulse = calculateAttentionPulse(rel, interactions);

  const getPulseColor = (status: string) => {
    switch (status) {
      case "healthy": return "#22c55e"; // Green
      case "due": return "#eab308";     // Yellow
      case "overdue": return "#ef4444"; // Red
      default: return "#6b7280";        // Muted gray for dormant
    }
  };

  return (
    <div className="qilife-card people-relationship-summary" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em" }}>Relationship Summary</h4>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 650,
            padding: "3px 8px",
            borderRadius: "6px",
            background: `${getPulseColor(pulse.status)}20`,
            color: getPulseColor(pulse.status),
            border: `1px solid ${getPulseColor(pulse.status)}40`,
            textTransform: "uppercase",
          }}
        >
          {pulse.status === "healthy"
            ? "● Healthy Cadence"
            : pulse.status === "due"
            ? "▲ Due Soon"
            : pulse.status === "overdue"
            ? "🚨 Contact Overdue"
            : "💤 Dormant"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "rgba(0, 0, 0, 0.2)", padding: "10px", borderRadius: "8px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "var(--qi-faint, #666)", textTransform: "uppercase" }}>Category</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--qi-text, #fff)", textTransform: "capitalize" }}>{rel.category}</div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "var(--qi-faint, #666)", textTransform: "uppercase" }}>Status</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--qi-text, #fff)", textTransform: "capitalize" }}>{rel.status}</div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "var(--qi-faint, #666)", textTransform: "uppercase" }}>Last Meaningful Contact</div>
          <div style={{ fontSize: "12px", color: "var(--qi-muted, #aaa)" }}>
            {rel.lastMeaningfulContactAt ? new Date(rel.lastMeaningfulContactAt).toLocaleDateString() : "No record"}
            {pulse.daysSinceLastContact !== null && ` (${pulse.daysSinceLastContact} days ago)`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "var(--qi-faint, #666)", textTransform: "uppercase" }}>Target Cadence</div>
          <div style={{ fontSize: "12px", color: "var(--qi-muted, #aaa)" }}>
            Every {rel.communicationCadenceDays || 30} days
          </div>
        </div>
      </div>

      {rel.boundaries && rel.boundaries.length > 0 && (
        <div style={{ background: "rgba(239, 68, 68, 0.06)", borderLeft: "3px solid #ef4444", padding: "8px 10px", borderRadius: "4px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#fca5a5", marginBottom: "4px" }}>Boundaries & Preferences</div>
          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--qi-text, #eee)" }}>
            {rel.boundaries.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {((rel.thingsOwedToThem && rel.thingsOwedToThem.length > 0) || (rel.thingsOwedToMe && rel.thingsOwedToMe.length > 0)) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
          {rel.thingsOwedToThem && rel.thingsOwedToThem.length > 0 && (
            <div style={{ background: "rgba(234, 179, 8, 0.08)", padding: "8px", borderRadius: "6px" }}>
              <strong style={{ color: "#fde047", fontSize: "11px" }}>Owed to {person.name.givenName}:</strong>
              <ul style={{ margin: "4px 0 0", paddingLeft: "14px" }}>
                {rel.thingsOwedToThem.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {rel.thingsOwedToMe && rel.thingsOwedToMe.length > 0 && (
            <div style={{ background: "rgba(96, 165, 250, 0.08)", padding: "8px", borderRadius: "6px" }}>
              <strong style={{ color: "#93c5fd", fontSize: "11px" }}>Owed to You:</strong>
              <ul style={{ margin: "4px 0 0", paddingLeft: "14px" }}>
                {rel.thingsOwedToMe.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
