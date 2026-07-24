import React from "react";
import type { GoogleContactFieldDiff, GoogleContactSnapshot, GoogleContactSyncPlan, Person, SyncResolution } from "../types";

interface GoogleContactSyncPanelProps {
  person: Person;
  snapshot: GoogleContactSnapshot | null;
  diffs: GoogleContactFieldDiff[];
  syncPlan: GoogleContactSyncPlan | null;
  onResolutionChange?: (field: string, resolution: SyncResolution) => void;
}

export const GoogleContactSyncPanel: React.FC<GoogleContactSyncPanelProps> = ({
  person,
  snapshot,
  diffs,
  syncPlan,
  onResolutionChange,
}) => {
  if (!person.googleLink?.resourceName) {
    return (
      <div className="qilife-card people-google-sync" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em" }}>Google Contacts Synchronization</h4>
          <span style={{ fontSize: "10px", background: "rgba(107, 114, 128, 0.2)", color: "#9ca3af", padding: "2px 6px", borderRadius: "4px" }}>
            Not Linked
          </span>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px", borderRadius: "8px", border: "1px dashed #444", fontSize: "12px", color: "var(--qi-muted, #aaa)" }}>
          <p style={{ margin: "0 0 8px" }}>
            This person is not currently linked to a Google Contacts record.
          </p>
          <button type="button" className="qilife-mini-btn" disabled style={{ opacity: 0.5 }}>
            Link Google Contact (Integration Scaffold)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qilife-card people-google-sync" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em" }}>Google Contacts Synchronization</h4>
          <div style={{ fontSize: "11px", color: "var(--qi-faint, #666)" }}>
            Resource: {person.googleLink.resourceName}
          </div>
        </div>

        <span
          style={{
            fontSize: "10px",
            fontWeight: 650,
            padding: "3px 8px",
            borderRadius: "4px",
            background: "rgba(234, 179, 8, 0.15)",
            color: "#fde047",
            border: "1px solid rgba(234, 179, 8, 0.3)",
          }}
        >
          Reviewable Diff
        </span>
      </div>

      <div style={{ background: "rgba(96, 165, 250, 0.06)", borderLeft: "3px solid #60a5fa", padding: "8px 10px", borderRadius: "4px", fontSize: "11px", color: "#93c5fd" }}>
        <strong>Privacy Guardrail:</strong> Synchronizing only compares portable address book fields (names, phones, emails, address). Private notes, Journal links, and relationship insights remain strictly in QiLife.
      </div>

      {diffs.length === 0 ? (
        <div style={{ color: "var(--qi-faint, #666)", fontSize: "12px", fontStyle: "italic" }}>
          No field differences detected. Contact is in sync.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "rgba(0, 0, 0, 0.3)", textAlign: "left", color: "var(--qi-faint, #666)", borderBottom: "1px solid #333" }}>
                <th style={{ padding: "6px 8px" }}>Field</th>
                <th style={{ padding: "6px 8px" }}>QiLife Truth</th>
                <th style={{ padding: "6px 8px" }}>Google Snapshot</th>
                <th style={{ padding: "6px 8px" }}>Status</th>
                <th style={{ padding: "6px 8px" }}>Resolution Plan</th>
              </tr>
            </thead>
            <tbody>
              {diffs.map((diff) => {
                const currentResolution = syncPlan?.resolutions[diff.field] || "keep_qilife";
                return (
                  <tr key={diff.field} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "8px", fontWeight: 600, color: "var(--qi-text, #fff)" }}>
                      {diff.field}
                    </td>
                    <td style={{ padding: "8px", color: "var(--qi-muted, #aaa)" }}>
                      {diff.qilifeValue || <em style={{ color: "#555" }}>(Empty)</em>}
                    </td>
                    <td style={{ padding: "8px", color: "var(--qi-muted, #aaa)" }}>
                      {diff.googleValue || <em style={{ color: "#555" }}>(Empty)</em>}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: diff.status === "match" ? "#10b98120" : "#ef444420",
                          color: diff.status === "match" ? "#10b981" : "#ef4444",
                        }}
                      >
                        {diff.status}
                      </span>
                    </td>
                    <td style={{ padding: "8px" }}>
                      <select
                        value={currentResolution}
                        onChange={(e) => onResolutionChange && onResolutionChange(diff.field, e.target.value as SyncResolution)}
                        style={{ background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                      >
                        <option value="keep_qilife">Keep QiLife</option>
                        <option value="use_google">Use Google</option>
                        <option value="merge">Merge Both</option>
                        <option value="skip">Skip Field</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
        <button type="button" className="qilife-mini-btn" disabled style={{ opacity: 0.5 }}>
          Execute Sync Plan (OAuth Integration Scaffold)
        </button>
      </div>
    </div>
  );
};
