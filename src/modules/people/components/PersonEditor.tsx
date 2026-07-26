import React, { useState } from "react";
import type { ContactMethod, Person, PersonName, RelationshipCategory, RelationshipStatus, UpdatePersonInput } from "../types";
import { ContactMethodsPanel } from "./ContactMethodsPanel";

interface PersonEditorProps {
  person?: Person | null;
  onSave: (input: UpdatePersonInput & { name: PersonName }) => Promise<unknown>;
  onCancel?: () => void;
}

export const PersonEditor: React.FC<PersonEditorProps> = ({ person, onSave, onCancel }) => {
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
    <form onSubmit={handleSubmit} className="qilife-card people-editor" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3 style={{ margin: 0, fontSize: "16px", letterSpacing: "-0.02em" }}>
        {person ? `Edit Person: ${person.name.formattedName}` : "Create New Person"}
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Given Name *</label>
          <input
            type="text"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            required
            style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "13px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Family Name</label>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "13px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Preferred Name</label>
          <input
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "13px" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Organization</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Company, institution, team..."
            style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "13px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Job Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Title or role..."
            style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "13px" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as RelationshipCategory)}
            style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "13px" }}
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
          <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Relationship Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RelationshipStatus)}
            style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "13px" }}
          >
            <option value="active">Active</option>
            <option value="dormant">Dormant</option>
            <option value="pending_introduction">Pending Introduction</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Cadence (Target Days)</label>
          <input
            type="number"
            min={1}
            max={365}
            value={cadenceDays}
            onChange={(e) => setCadenceDays(parseInt(e.target.value, 10) || 30)}
            style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "13px" }}
          />
        </div>
      </div>

      <ContactMethodsPanel methods={contactMethods} onChange={setContactMethods} />

      <div>
        <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>Boundaries & Preferences (One per line)</label>
        <textarea
          value={boundariesText}
          onChange={(e) => setBoundariesText(e.target.value)}
          rows={2}
          placeholder="e.g. No evening calls after 7 PM&#10;Prefers written updates..."
          style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "12px" }}
        />
      </div>

      <div>
        <label style={{ fontSize: "11px", color: "var(--qi-faint, #666)", display: "block", marginBottom: "4px" }}>User Notes & Context</label>
        <textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          rows={3}
          placeholder="Personal context, background, preferences..."
          style={{ width: "100%", background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "6px", border: "1px solid #333", fontSize: "12px" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="qilife-mini-btn">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="qilife-mini-btn" style={{ background: "#c084fc", color: "#000", fontWeight: "bold" }}>
          {saving ? "Saving..." : "Save Person Record"}
        </button>
      </div>
    </form>
  );
};
