import React from "react";
import { usePeople } from "../hooks/usePeople";

export const FollowUpsWidget: React.FC = () => {
  const { people, loading } = usePeople();

  if (loading) {
    return <div className="qilife-card" style={{ fontSize: "12px", color: "#888" }}>Loading pending follow-ups...</div>;
  }

  const allFollowUps = people.flatMap((p) =>
    (p.relationship.followUps || [])
      .filter((fu) => !fu.isCompleted)
      .map((fu) => ({ ...fu, personName: p.name.formattedName }))
  );

  return (
    <div className="qilife-card people-followups-widget" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "13px" }}>📌 Pending CRM Follow-ups</h4>
        <span style={{ fontSize: "10px", background: "rgba(234, 179, 8, 0.15)", color: "#fde047", padding: "2px 6px", borderRadius: "4px" }}>
          {allFollowUps.length} Pending
        </span>
      </div>

      {allFollowUps.length === 0 ? (
        <div style={{ fontSize: "11px", color: "var(--qi-faint, #666)", fontStyle: "italic" }}>
          No pending relationship follow-ups.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {allFollowUps.slice(0, 3).map((fu) => (
            <div key={fu.id} style={{ fontSize: "11px", background: "rgba(255, 255, 255, 0.02)", padding: "6px 8px", borderRadius: "6px" }}>
              <div style={{ fontWeight: 600, color: "var(--qi-text, #fff)" }}>{fu.title}</div>
              <div style={{ fontSize: "10px", color: "var(--qi-muted, #aaa)" }}>With: {fu.personName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
