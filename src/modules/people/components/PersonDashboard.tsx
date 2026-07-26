import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGoogleContactSync } from "../hooks/useGoogleContactSync";
import { usePerson } from "../hooks/usePerson";
import { usePersonInteractions } from "../hooks/usePersonInteractions";
import { ContactMethodsPanel } from "./ContactMethodsPanel";
import { FollowUpsPanel } from "./FollowUpsPanel";
import { GoogleContactSyncPanel } from "./GoogleContactSyncPanel";
import { InsightsPanel } from "./InsightsPanel";
import { InteractionTimeline } from "./InteractionTimeline";
import { PersonEditor } from "./PersonEditor";
import { RelatedRecordsPanel } from "./RelatedRecordsPanel";
import { RelationshipSummary } from "./RelationshipSummary";

interface PersonDashboardProps {
  personId: string;
  defaultTab?: "overview" | "interactions" | "followups" | "related" | "insights" | "sync";
  onBack?: () => void;
  onEdit?: () => void;
}

export const PersonDashboard: React.FC<PersonDashboardProps> = ({ personId, defaultTab = "overview", onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "interactions" | "followups" | "related" | "insights" | "sync">(defaultTab);
  const [isEditing, setIsEditing] = useState(false);

  const { person, insights, relatedRecords, loading, error, updatePerson, archivePerson, refetch } = usePerson(personId);
  const { interactions, addInteraction } = usePersonInteractions(personId);
  const { snapshot, diffs, syncPlan, setResolution } = useGoogleContactSync(person);

  if (loading) {
    return <div className="qilife-card" style={{ padding: "20px", color: "#aaa" }}>Loading person profile...</div>;
  }

  if (error || !person) {
    return (
      <div className="qilife-card" style={{ padding: "20px", color: "#ef4444" }}>
        {error ? error.message : "Person record not found."}
      </div>
    );
  }

  if (isEditing) {
    return (
      <PersonEditor
        person={person}
        onSave={async (patch) => {
          await updatePerson(patch);
          setIsEditing(false);
          refetch();
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const primaryEmail = person.contactMethods.find((c) => c.kind === "email")?.value;
  const primaryPhone = person.contactMethods.find((c) => c.kind.includes("phone"))?.value;

  return (
    <div className="people-dashboard" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Header Card */}
      <div className="qilife-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px" }}>
        <div>
          {onBack && (
            <button type="button" onClick={onBack} className="qilife-mini-btn" style={{ marginBottom: "8px" }}>
              ← Back to People
            </button>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(192, 132, 252, 0.2)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold" }}>
              {person.name.givenName[0]}
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: "20px", letterSpacing: "-0.02em" }}>
                {person.name.formattedName}
              </h2>

              <div style={{ fontSize: "12px", color: "var(--qi-muted, #aaa)", display: "flex", gap: "12px", marginTop: "2px" }}>
                {person.organization && (
                  <span>💼 {person.organization.jobTitle ? `${person.organization.jobTitle} at ` : ""}{person.organization.organizationName}</span>
                )}
                {primaryEmail && <span>✉ {primaryEmail}</span>}
                {primaryPhone && <span>📞 {primaryPhone}</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link className="qilife-mini-btn" to={`/journal/new?personId=${encodeURIComponent(person.id)}`}>
            New journal entry
          </Link>
          <button type="button" onClick={() => onEdit ? onEdit() : setIsEditing(true)} className="qilife-mini-btn">
            ✏ Edit Person
          </button>
          <button
            type="button"
            onClick={async () => {
              if (confirm(`Archive ${person.name.formattedName}?`)) {
                await archivePerson();
                onBack && onBack();
              }
            }}
            className="qilife-mini-btn"
            style={{ color: "#ef4444" }}
          >
            Archive
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--qi-border, rgba(255, 255, 255, 0.1))", paddingBottom: "4px" }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "interactions", label: `Interactions (${interactions.length})` },
          { id: "followups", label: "Follow-ups" },
          { id: "related", label: `Related Records (${relatedRecords.length})` },
          { id: "insights", label: `Insights (${insights.length})` },
          { id: "sync", label: "Google Sync" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              background: activeTab === tab.id ? "rgba(192, 132, 252, 0.15)" : "transparent",
              color: activeTab === tab.id ? "#c084fc" : "var(--qi-muted, #888)",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <RelationshipSummary person={person} interactions={interactions} />
            <ContactMethodsPanel methods={person.contactMethods} readOnly />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {person.userNotes && (
              <div className="qilife-card">
                <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>User Notes & Context</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--qi-muted, #aaa)", whiteSpace: "pre-wrap" }}>
                  {person.userNotes}
                </p>
              </div>
            )}
            <InsightsPanel insights={insights} />
            <FollowUpsPanel person={person} />
          </div>
        </div>
      )}

      {activeTab === "interactions" && (
        <InteractionTimeline interactions={interactions} onAddInteraction={addInteraction} />
      )}

      {activeTab === "followups" && (
        <FollowUpsPanel person={person} />
      )}

      {activeTab === "related" && (
        <RelatedRecordsPanel records={relatedRecords} />
      )}

      {activeTab === "insights" && (
        <InsightsPanel insights={insights} />
      )}

      {activeTab === "sync" && (
        <GoogleContactSyncPanel
          person={person}
          snapshot={snapshot}
          diffs={diffs}
          syncPlan={syncPlan}
          onResolutionChange={setResolution}
        />
      )}
    </div>
  );
};
