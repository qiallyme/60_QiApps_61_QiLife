import React, { useId, useState } from "react";
import type { ContactMethod, Person, PersonName, RelationshipCategory, RelationshipStatus, UpdatePersonInput } from "../types";
import { ContactMethodsPanel } from "./ContactMethodsPanel";

interface PersonEditorProps {
  person?: Person | null;
  onSave: (input: UpdatePersonInput & { name: PersonName }) => Promise<unknown>;
  onCancel?: () => void;
}

export const PersonEditor: React.FC<PersonEditorProps> = ({ person, onSave, onCancel }) => {
  const fieldId = useId();
  const [givenName, setGivenName] = useState(person?.name.givenName || "");
  const [familyName, setFamilyName] = useState(person?.name.familyName || "");
  const [preferredName, setPreferredName] = useState(person?.name.preferredName || "");
  const [orgName, setOrgName] = useState(person?.organization?.organizationName || "");
  const [jobTitle, setJobTitle] = useState(person?.organization?.jobTitle || "");
  const [category, setCategory] = useState<RelationshipCategory>(person?.relationship.category || "colleague");
  const [status, setStatus] = useState<RelationshipStatus>(person?.relationship.status || "active");
  const [cadenceDays, setCadenceDays] = useState(person?.relationship.communicationCadenceDays || 30);
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>(person?.contactMethods || []);
  const [userNotes, setUserNotes] = useState(person?.userNotes || "");
  const [boundariesText, setBoundariesText] = useState((person?.relationship.boundaries || []).join("\n"));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const boundaries = boundariesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const formattedName = [givenName, familyName].filter(Boolean).join(" ");

      await onSave({
        name: {
          givenName,
          familyName: familyName || undefined,
          preferredName: preferredName || undefined,
          formattedName,
        },
        organization: orgName ? { organizationName: orgName, jobTitle: jobTitle || undefined } : undefined,
        relationship: {
          category,
          status,
          communicationCadenceDays: cadenceDays,
          boundaries,
        },
        contactMethods,
        userNotes: userNotes || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="qilife-card people-editor">
      <h3>
        {person ? `Edit Person: ${person.name.formattedName}` : "Create New Person"}
      </h3>

      <div className="qilife-form-grid three">
        <div>
          <label className="qilife-label" htmlFor={`${fieldId}-given-name`}>Given Name *</label>
          <input
            id={`${fieldId}-given-name`}
            name="givenName"
            type="text"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="qilife-label" htmlFor={`${fieldId}-family-name`}>Family Name</label>
          <input
            id={`${fieldId}-family-name`}
            name="familyName"
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />
        </div>

        <div>
          <label className="qilife-label" htmlFor={`${fieldId}-preferred-name`}>Preferred Name</label>
          <input
            id={`${fieldId}-preferred-name`}
            name="preferredName"
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
          />
        </div>
      </div>

      <div className="qilife-form-grid two">
        <div>
          <label className="qilife-label" htmlFor={`${fieldId}-organization`}>Organization</label>
          <input
            id={`${fieldId}-organization`}
            name="organization"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Company, institution, team..."
          />
        </div>

        <div>
          <label className="qilife-label" htmlFor={`${fieldId}-job-title`}>Job Title</label>
          <input
            id={`${fieldId}-job-title`}
            name="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Title or role..."
          />
        </div>
      </div>

      <div className="qilife-form-grid three">
        <div>
          <label className="qilife-label" htmlFor={`${fieldId}-category`}>Category</label>
          <select
            id={`${fieldId}-category`}
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as RelationshipCategory)}
          >
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="colleague">Colleague</option>
            <option value="client">Client</option>
            <option value="mentor">Mentor</option>
            <option value="service_provider">Service Provider</option>
            <option value="acquaintance">Acquaintance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="qilife-label" htmlFor={`${fieldId}-status`}>Relationship Status</label>
          <select
            id={`${fieldId}-status`}
            name="relationshipStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value as RelationshipStatus)}
          >
            <option value="active">Active</option>
            <option value="dormant">Dormant</option>
            <option value="pending_introduction">Pending Introduction</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="qilife-label" htmlFor={`${fieldId}-cadence`}>Cadence (Target Days)</label>
          <input
            id={`${fieldId}-cadence`}
            name="communicationCadenceDays"
            type="number"
            min={1}
            max={365}
            value={cadenceDays}
            onChange={(e) => setCadenceDays(parseInt(e.target.value, 10) || 30)}
          />
        </div>
      </div>

      <ContactMethodsPanel methods={contactMethods} onChange={setContactMethods} />

      <div>
        <label className="qilife-label" htmlFor={`${fieldId}-boundaries`}>Boundaries & Preferences (One per line)</label>
        <textarea
          id={`${fieldId}-boundaries`}
          name="boundaries"
          value={boundariesText}
          onChange={(e) => setBoundariesText(e.target.value)}
          rows={2}
          placeholder="e.g. No evening calls after 7 PM&#10;Prefers written updates..."
        />
      </div>

      <div>
        <label className="qilife-label" htmlFor={`${fieldId}-notes`}>User Notes & Context</label>
        <textarea
          id={`${fieldId}-notes`}
          name="userNotes"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          rows={3}
          placeholder="Personal context, background, preferences..."
        />
      </div>

      <div className="qilife-form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="qilife-mini-btn">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="qilife-mini-btn primary">
          {saving ? "Saving..." : "Save Person Record"}
        </button>
      </div>
    </form>
  );
};
