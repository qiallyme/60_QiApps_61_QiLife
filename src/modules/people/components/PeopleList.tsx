import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePeople } from "../hooks/usePeople";
import type { Person } from "../types";
import { calculateAttentionPulse } from "../services/relationshipService";
import { PeopleFilters } from "./PeopleFilters";

export const PeopleList: React.FC = () => {
  const navigate = useNavigate();
  const { people, loading, error, query, setQuery } = usePeople();
  const [layoutMode, setLayoutMode] = useState<"table" | "cards">("cards");

  const getPulseBadge = (person: Person) => {
    const pulse = calculateAttentionPulse(person.relationship, []);
    switch (pulse.status) {
      case "healthy": return <span style={{ color: "#22c55e", fontSize: "11px" }}>● Healthy</span>;
      case "due": return <span style={{ color: "#eab308", fontSize: "11px" }}>▲ Due Soon</span>;
      case "overdue": return <span style={{ color: "#ef4444", fontSize: "11px", fontWeight: "bold" }}>🚨 Overdue</span>;
      default: return <span style={{ color: "#6b7280", fontSize: "11px" }}>💤 Dormant</span>;
    }
  };

  return (
    <div className="people-list-module" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Action Header */}
      <div className="qilife-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", letterSpacing: "-0.02em" }}>People / Personal CRM</h2>
          <div style={{ fontSize: "12px", color: "var(--qi-muted, #aaa)", marginTop: "2px" }}>
            {people.length} Contact(s) • Relationship & Cadence Tracking
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "#111", border: "1px solid #333", borderRadius: "6px", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setLayoutMode("cards")}
              style={{
                background: layoutMode === "cards" ? "rgba(192, 132, 252, 0.2)" : "transparent",
                color: layoutMode === "cards" ? "#c084fc" : "#aaa",
                border: "none",
                padding: "4px 8px",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("table")}
              style={{
                background: layoutMode === "table" ? "rgba(192, 132, 252, 0.2)" : "transparent",
                color: layoutMode === "table" ? "#c084fc" : "#aaa",
                border: "none",
                padding: "4px 8px",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Table
            </button>
          </div>

          <button
            type="button"
            className="qilife-mini-btn"
            onClick={() => navigate("/people/new")}
            style={{ background: "#c084fc", color: "#000", fontWeight: "bold" }}
          >
            + Add Person
          </button>
        </div>
      </div>

      <PeopleFilters query={query} onChange={setQuery} />

      {loading ? (
        <div className="qilife-card" style={{ padding: "24px", color: "#aaa", textAlign: "center" }}>
          Loading contacts...
        </div>
      ) : error ? (
        <div className="qilife-card" style={{ padding: "24px", color: "#ef4444" }}>
          {error.message}
        </div>
      ) : people.length === 0 ? (
        <div className="qilife-card" style={{ padding: "32px", color: "var(--qi-muted, #888)", textAlign: "center" }}>
          No contacts match your query.
        </div>
      ) : layoutMode === "cards" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {people.map((person) => {
            const primaryEmail = person.contactMethods.find((c) => c.kind === "email")?.value;
            const primaryPhone = person.contactMethods.find((c) => c.kind.includes("phone"))?.value;
            return (
              <div
                key={person.id}
                className="qilife-card"
                onClick={() => navigate(`/people/${person.id}`)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "14px",
                  transition: "transform 0.1s ease, border-color 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(192, 132, 252, 0.15)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      {person.name.givenName[0]}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em", color: "var(--qi-text, #fff)" }}>
                        {person.name.formattedName}
                      </h4>
                      {person.organization && (
                        <div style={{ fontSize: "11px", color: "var(--qi-muted, #aaa)" }}>
                          {person.organization.organizationName}
                        </div>
                      )}
                    </div>
                  </div>

                  {getPulseBadge(person)}
                </div>

                <div style={{ fontSize: "11px", color: "var(--qi-muted, #888)", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {primaryEmail && <div>✉ {primaryEmail}</div>}
                  {primaryPhone && <div>📞 {primaryPhone}</div>}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "6px" }}>
                  <span style={{ color: "var(--qi-faint, #666)", textTransform: "capitalize" }}>Category: {person.relationship.category}</span>
                  <span style={{ color: "#c084fc", fontWeight: 600 }}>View Profile →</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="qilife-card" style={{ overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "rgba(0, 0, 0, 0.3)", textAlign: "left", color: "var(--qi-faint, #666)", borderBottom: "1px solid #333" }}>
                <th style={{ padding: "10px 12px" }}>Name</th>
                <th style={{ padding: "10px 12px" }}>Category</th>
                <th style={{ padding: "10px 12px" }}>Organization</th>
                <th style={{ padding: "10px 12px" }}>Contact</th>
                <th style={{ padding: "10px 12px" }}>Pulse Status</th>
                <th style={{ padding: "10px 12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => {
                const primaryEmail = person.contactMethods.find((c) => c.kind === "email")?.value;
                return (
                  <tr
                    key={person.id}
                    onClick={() => navigate(`/people/${person.id}`)}
                    style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", cursor: "pointer" }}
                  >
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--qi-text, #fff)" }}>
                      {person.name.formattedName}
                    </td>
                    <td style={{ padding: "10px 12px", textTransform: "capitalize", color: "var(--qi-muted, #aaa)" }}>
                      {person.relationship.category}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--qi-muted, #aaa)" }}>
                      {person.organization?.organizationName || "—"}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--qi-muted, #aaa)" }}>
                      {primaryEmail || "—"}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {getPulseBadge(person)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button type="button" className="qilife-mini-btn" style={{ fontSize: "10px" }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
