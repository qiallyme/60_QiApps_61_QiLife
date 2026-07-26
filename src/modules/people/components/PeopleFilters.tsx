import React from "react";
import type { AttentionLevel, PeopleQuery, RelationshipCategory, RelationshipStatus } from "../types";

interface PeopleFiltersProps {
  query?: PeopleQuery;
  onChange: (query: PeopleQuery) => void;
}

export const PeopleFilters: React.FC<PeopleFiltersProps> = ({ query = {}, onChange }) => {
  return (
    <div className="qilife-card people-filters" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", padding: "10px 12px" }}>
      <div style={{ flex: "1 1 200px" }}>
        <input
          type="text"
          placeholder="Search people by name, company, email..."
          value={query.search || ""}
          onChange={(e) => onChange({ ...query, search: e.target.value || undefined })}
          style={{ width: "100%", background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "6px", padding: "6px 10px", fontSize: "12px" }}
        />
      </div>

      <select
        value={query.category || ""}
        onChange={(e) => onChange({ ...query, category: (e.target.value as RelationshipCategory) || undefined })}
        style={{ background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "6px", padding: "6px 8px", fontSize: "12px" }}
      >
        <option value="">All Categories</option>
        <option value="family">Family</option>
        <option value="friend">Friend</option>
        <option value="colleague">Colleague</option>
        <option value="client">Client</option>
        <option value="mentor">Mentor</option>
        <option value="service_provider">Service Provider</option>
        <option value="acquaintance">Acquaintance</option>
      </select>

      <select
        value={query.status || ""}
        onChange={(e) => onChange({ ...query, status: (e.target.value as RelationshipStatus) || undefined })}
        style={{ background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "6px", padding: "6px 8px", fontSize: "12px" }}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="dormant">Dormant</option>
        <option value="pending_introduction">Pending Intro</option>
        <option value="archived">Archived</option>
      </select>

      <select
        value={query.attentionLevel || ""}
        onChange={(e) => onChange({ ...query, attentionLevel: (e.target.value as AttentionLevel) || undefined })}
        style={{ background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "6px", padding: "6px 8px", fontSize: "12px" }}
      >
        <option value="">All Priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--qi-muted, #aaa)", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={Boolean(query.needsContact)}
          onChange={(e) => onChange({ ...query, needsContact: e.target.checked || undefined })}
        />
        🚨 Overdue Contact Only
      </label>
    </div>
  );
};
