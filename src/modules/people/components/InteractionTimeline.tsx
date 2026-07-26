import React, { useState } from "react";
import type { Interaction, InteractionDirection, InteractionType } from "../types";
import { formatInteractionDirection, formatInteractionType } from "../services/interactionService";

interface InteractionTimelineProps {
  interactions: Interaction[];
  onAddInteraction?: (interaction: Omit<Interaction, "id">) => Promise<unknown>;
}

export const InteractionTimeline: React.FC<InteractionTimelineProps> = ({
  interactions,
  onAddInteraction,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<InteractionType>("call");
  const [direction, setDirection] = useState<InteractionDirection>("mutual");
  const [isMeaningful, setIsMeaningful] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !onAddInteraction) return;
    setSubmitting(true);
    try {
      await onAddInteraction({
        personId: interactions[0]?.personId || "",
        timestamp: new Date().toISOString(),
        type,
        direction,
        summary,
        body: body || undefined,
        isMeaningful,
        sourceModule: "people",
      });
      setSummary("");
      setBody("");
      setShowAddForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getDirectionBadge = (dir: InteractionDirection) => {
    switch (dir) {
      case "inbound": return { label: "← Inbound", color: "#3b82f6" };
      case "outbound": return { label: "→ Outbound", color: "#8b5cf6" };
      case "mutual": return { label: "↔ Mutual", color: "#10b981" };
      case "internal_note": return { label: "🔒 Note", color: "#6b7280" };
    }
  };

  return (
    <div className="qilife-card people-interaction-timeline" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em" }}>Interaction History</h4>
        {onAddInteraction && (
          <button
            type="button"
            className="qilife-mini-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ fontSize: "11px", padding: "4px 8px" }}
          >
            {showAddForm ? "Cancel" : "+ Log Interaction"}
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} style={{ background: "rgba(0, 0, 0, 0.3)", padding: "12px", borderRadius: "8px", border: "1px solid #333", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <select value={type} onChange={(e) => setType(e.target.value as InteractionType)} style={{ background: "#111", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "12px" }}>
              <option value="call">Call</option>
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="visit">Visit</option>
              <option value="favor">Favor</option>
              <option value="check_in">Check-in</option>
              <option value="shared_event">Shared Event</option>
            </select>

            <select value={direction} onChange={(e) => setDirection(e.target.value as InteractionDirection)} style={{ background: "#111", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "12px" }}>
              <option value="mutual">Mutual</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
              <option value="internal_note">Internal Note</option>
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#aaa" }}>
              <input type="checkbox" checked={isMeaningful} onChange={(e) => setIsMeaningful(e.target.checked)} />
              Meaningful Contact
            </label>
          </div>

          <input
            type="text"
            placeholder="Summary of interaction..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            style={{ background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "4px", border: "1px solid #444", fontSize: "12px" }}
          />

          <textarea
            placeholder="Details or private notes..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            style={{ background: "#111", color: "#fff", padding: "6px 8px", borderRadius: "4px", border: "1px solid #444", fontSize: "12px" }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={submitting} className="qilife-mini-btn" style={{ background: "#c084fc", color: "#000", fontWeight: "bold" }}>
              {submitting ? "Saving..." : "Save Interaction"}
            </button>
          </div>
        </form>
      )}

      {interactions.length === 0 ? (
        <div style={{ color: "var(--qi-faint, #666)", fontSize: "12px", fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
          No recorded interactions yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
          {interactions.map((int) => {
            const dirBadge = getDirectionBadge(int.direction);
            return (
              <div
                key={int.id}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--qi-border, rgba(255, 255, 255, 0.08))",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 650, color: dirBadge.color, background: `${dirBadge.color}15`, padding: "2px 6px", borderRadius: "4px" }}>
                      {dirBadge.label}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--qi-text, #fff)" }}>
                      {int.summary}
                    </span>
                  </div>

                  <span style={{ fontSize: "11px", color: "var(--qi-faint, #666)" }}>
                    {new Date(int.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {int.body && (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--qi-muted, #aaa)", whiteSpace: "pre-wrap" }}>
                    {int.body}
                  </p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "10px", color: "var(--qi-faint, #666)" }}>
                  <span>Type: {formatInteractionType(int.type)}</span>
                  <span>Meaningful: {int.isMeaningful ? "Yes" : "No"}</span>
                  {int.sourceModule && <span>Source: {int.sourceModule}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
