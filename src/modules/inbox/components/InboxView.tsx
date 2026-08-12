import { useEffect, useState } from "react";
import type { QiBit } from "../../../features/qilife/types";
import { listAllRecords } from "../../../features/qilife/services/qilifeStore";
import { qiRecordToQiBit } from "../../../features/qilife/services/qiBitMapper";
import { detectOpenLoops, openLoopToCandidateAction } from "../../../features/qilife/services/openLoopDetector";

export function InboxView() {
  const [captures, setCaptures] = useState<QiBit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    listAllRecords()
      .then((records) => {
        const bits = records.map(qiRecordToQiBit);
        // Filter inbox captures (unclassified or qibit)
        const unclassified = bits.filter((b) => b.type === "capture" || b.metadata.status === "inbox");
        setCaptures(unclassified);
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (id: string, actionType: string) => {
    setProcessedIds((prev) => new Set(prev).add(id));
    alert(`Capture ${id} marked as ${actionType}.`);
  };

  return (
    <div className="qilife-page" style={{ maxWidth: "1050px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-block", background: "#e0e7ff", color: "#3730a3", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", padding: "3px 10px", borderRadius: "12px", marginBottom: "0.5rem" }}>
          TRIAGE & REVIEW
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.03em" }}>
          Universal Inbox
        </h1>
        <p style={{ color: "#475569", fontSize: "1rem", marginTop: "0.25rem" }}>
          Newly captured notes, voice logs, links, and AI-detected candidate loops awaiting review.
        </p>
      </header>

      {loading ? (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "2rem", borderRadius: "14px", textAlign: "center", color: "#64748b" }}>
          Loading Inbox captures...
        </div>
      ) : captures.length === 0 ? (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "3rem 2rem", textAlign: "center", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📬</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>Your Inbox is Clear!</h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto" }}>
            All captured notes, thoughts, and tasks have been organized into active projects and actions. Use <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>Ctrl + K</kbd> anytime to capture new information.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {captures.map((bit) => {
            const isProcessed = processedIds.has(bit.id);
            if (isProcessed) return null;

            const derivedLoops = detectOpenLoops(bit);
            const candidate = derivedLoops[0] ? openLoopToCandidateAction(derivedLoops[0], bit) : null;

            return (
              <div
                key={bit.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 12px -2px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "6px" }}>
                      {bit.type}
                    </span>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                      {bit.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {new Date(bit.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {bit.body && (
                  <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1rem", background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", borderLeft: "3px solid #6366f1" }}>
                    {bit.body}
                  </p>
                )}

                {candidate && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#166534" }}>⚡ AI Detected Action Candidate:</div>
                      <div style={{ fontSize: "0.9rem", color: "#14532d", fontWeight: "600" }}>{candidate.title}</div>
                    </div>
                    <button
                      onClick={() => handleAction(bit.id, "Converted to Action")}
                      style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "0.4rem 0.85rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                    >
                      Approve Action
                    </button>
                  </div>
                )}

                {/* Triage Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleAction(bit.id, "Converted to Task")}
                    style={{ background: "#4f46e5", color: "#ffffff", border: "none", padding: "0.45rem 1rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                  >
                    Convert to Task
                  </button>
                  <button
                    onClick={() => handleAction(bit.id, "Promoted to Memory")}
                    style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "0.45rem 1rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                  >
                    Promote to Memory
                  </button>
                  <button
                    onClick={() => handleAction(bit.id, "Archived")}
                    style={{ background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", padding: "0.45rem 1rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                  >
                    Archive
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
