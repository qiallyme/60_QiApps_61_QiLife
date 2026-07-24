import React from "react";
import { usePeople } from "../hooks/usePeople";

export const RecentContactsWidget: React.FC = () => {
  const { people, loading } = usePeople();

  if (loading) {
    return <div className="qilife-card" style={{ fontSize: "12px", color: "#888" }}>Loading recent contacts...</div>;
  }

  const recent = people.slice(0, 4);

  return (
    <div className="qilife-card people-recent-widget" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "13px" }}>👥 Recent Contacts</h4>
        <span style={{ fontSize: "10px", color: "var(--qi-faint, #666)" }}>{people.length} Total</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {recent.map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", background: "rgba(255, 255, 255, 0.02)", padding: "6px 8px", borderRadius: "6px" }}>
            <span style={{ fontWeight: 600, color: "var(--qi-text, #fff)" }}>{p.name.formattedName}</span>
            <span style={{ fontSize: "10px", color: "var(--qi-faint, #666)", textTransform: "capitalize" }}>{p.relationship.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
