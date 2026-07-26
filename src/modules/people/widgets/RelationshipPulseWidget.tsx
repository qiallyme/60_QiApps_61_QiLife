import React from "react";
import { usePeople } from "../hooks/usePeople";
import { calculateAttentionPulse } from "../services/relationshipService";

export const RelationshipPulseWidget: React.FC = () => {
  const { people, loading } = usePeople();

  if (loading) {
    return <div className="qilife-card" style={{ fontSize: "12px", color: "#888" }}>Loading relationship pulse...</div>;
  }

  const pulses = people.map((p) => ({
    person: p,
    pulse: calculateAttentionPulse(p.relationship, []),
  }));

  const overdueCount = pulses.filter((p) => p.pulse.status === "overdue").length;
  const dueCount = pulses.filter((p) => p.pulse.status === "due").length;
  const healthyCount = pulses.filter((p) => p.pulse.status === "healthy").length;

  return (
    <div className="qilife-card people-pulse-widget" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "13px" }}>💓 Relationship Cadence Pulse</h4>
        <span style={{ fontSize: "10px", color: "var(--qi-faint, #666)" }}>{people.length} Tracked</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", textAlign: "center" }}>
        <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: "6px", padding: "6px" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#22c55e" }}>{healthyCount}</div>
          <div style={{ fontSize: "9px", color: "#86efac", textTransform: "uppercase" }}>Healthy</div>
        </div>

        <div style={{ background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "6px", padding: "6px" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#eab308" }}>{dueCount}</div>
          <div style={{ fontSize: "9px", color: "#fde047", textTransform: "uppercase" }}>Due Soon</div>
        </div>

        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", padding: "6px" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#ef4444" }}>{overdueCount}</div>
          <div style={{ fontSize: "9px", color: "#fca5a5", textTransform: "uppercase" }}>Overdue</div>
        </div>
      </div>
    </div>
  );
};
