import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecordList } from "../../../features/qilife/components/RecordList";
import { usePeople } from "../hooks/usePeople";
import type { Person } from "../types";
import { calculateAttentionPulse } from "../services/relationshipService";
import { PeopleFilters } from "./PeopleFilters";

export const PeopleList: React.FC = () => {
  const navigate = useNavigate();
  const { people, loading, error, query, setQuery } = usePeople();
  const [layoutMode, setLayoutMode] = useState<"rows" | "table">("rows");

  const pulseLabel = (person: Person) => {
    const pulse = calculateAttentionPulse(person.relationship, []);
    switch (pulse.status) {
      case "healthy":
        return "Healthy";
      case "due":
        return "Due Soon";
      case "overdue":
        return "Overdue";
      default:
        return "Dormant";
    }
  };

  const items = people.map((person) => {
    const primaryEmail = person.contactMethods.find((contact) => contact.kind === "email")?.value;
    const primaryPhone = person.contactMethods.find((contact) => contact.kind.includes("phone"))?.value;
    return {
      id: person.id,
      entityKey: "person",
      title: person.name.formattedName,
      metadata: [
        person.organization?.organizationName ?? "",
        primaryEmail ? `Email: ${primaryEmail}` : "",
        primaryPhone ? `Phone: ${primaryPhone}` : "",
      ].filter(Boolean).join(" · "),
      status: pulseLabel(person),
      priority: `Category: ${person.relationship.category}`,
      to: `/people/${person.id}`,
    };
  });

  return (
    <div className="people-list-module" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="qilife-card people-list-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", letterSpacing: "-0.02em" }}>People / Personal CRM</h2>
          <div style={{ fontSize: "12px", color: "var(--qi-muted, #aaa)", marginTop: "2px" }}>
            {people.length} Contact(s) · Relationship & Cadence Tracking
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "var(--qi-surface-interactive)", border: "1px solid var(--qi-border-primary)", borderRadius: "8px", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setLayoutMode("rows")}
              style={{
                background: layoutMode === "rows" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                color: layoutMode === "rows" ? "var(--qi-primary)" : "var(--qi-muted)",
                border: "none",
                padding: "6px 10px",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Rows
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("table")}
              style={{
                background: layoutMode === "table" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                color: layoutMode === "table" ? "var(--qi-primary)" : "var(--qi-muted)",
                border: "none",
                padding: "6px 10px",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Table
            </button>
          </div>

          <button type="button" className="qilife-mini-btn" onClick={() => navigate("/people/new")}>
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
      ) : layoutMode === "rows" ? (
        <RecordList ariaLabel="People" emptyMessage="No contacts match your query." items={items} />
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
                const primaryEmail = person.contactMethods.find((contact) => contact.kind === "email")?.value;
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
                    <td style={{ padding: "10px 12px", color: "var(--qi-muted, #aaa)" }}>
                      {pulseLabel(person)}
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
