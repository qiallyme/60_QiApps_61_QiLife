import React, { useId } from "react";
import type { AttentionLevel, PeopleQuery, RelationshipCategory, RelationshipStatus } from "../types";

interface PeopleFiltersProps {
  query?: PeopleQuery;
  onChange: (query: PeopleQuery) => void;
}

export const PeopleFilters: React.FC<PeopleFiltersProps> = ({ query = {}, onChange }) => {
  const fieldId = useId();

  return (
    <div className="qilife-card people-filters">
      <div className="people-filter-search">
        <label className="qilife-sr-only" htmlFor={`${fieldId}-search`}>Search people</label>
        <input
          id={`${fieldId}-search`}
          name="peopleSearch"
          type="text"
          placeholder="Search people by name, company, email..."
          value={query.search || ""}
          onChange={(event) => onChange({ ...query, search: event.target.value || undefined })}
        />
      </div>

      <label className="qilife-sr-only" htmlFor={`${fieldId}-category`}>Relationship category</label>
      <select
        id={`${fieldId}-category`}
        name="peopleCategory"
        value={query.category || ""}
        onChange={(event) => onChange({
          ...query,
          category: (event.target.value as RelationshipCategory) || undefined,
        })}
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

      <label className="qilife-sr-only" htmlFor={`${fieldId}-status`}>Relationship status</label>
      <select
        id={`${fieldId}-status`}
        name="peopleStatus"
        value={query.status || ""}
        onChange={(event) => onChange({
          ...query,
          status: (event.target.value as RelationshipStatus) || undefined,
        })}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="dormant">Dormant</option>
        <option value="pending_introduction">Pending Intro</option>
        <option value="archived">Archived</option>
      </select>

      <label className="qilife-sr-only" htmlFor={`${fieldId}-attention`}>Attention level</label>
      <select
        id={`${fieldId}-attention`}
        name="peopleAttention"
        value={query.attentionLevel || ""}
        onChange={(event) => onChange({
          ...query,
          attentionLevel: (event.target.value as AttentionLevel) || undefined,
        })}
      >
        <option value="">All Priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <label className="qilife-check-label" htmlFor={`${fieldId}-needs-contact`}>
        <input
          id={`${fieldId}-needs-contact`}
          name="needsContact"
          type="checkbox"
          checked={Boolean(query.needsContact)}
          onChange={(event) => onChange({
            ...query,
            needsContact: event.target.checked || undefined,
          })}
        />
        Overdue contact only
      </label>
    </div>
  );
};
