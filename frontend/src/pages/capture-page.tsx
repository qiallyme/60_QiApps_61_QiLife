import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockIngestion } from "../utils/mock-agent";
import { savePendingDraft } from "../utils/storage";

const SOURCE_TYPES = ["", "note", "document", "task", "care", "finance", "legal", "tech", "other"];

export function CapturePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [status, setStatus] = useState<"idle" | "processing">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) return;

    setStatus("processing");
    
    // Simulate ingestion delay
    setTimeout(() => {
      const draft = mockIngestion(rawText, sourceType);
      savePendingDraft(draft);
      setStatus("idle");
      navigate("/review");
    }, 600);
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="section-tag">Capture</div>
        <h2>Drop anything here.</h2>
        <p>Raw text, ideas, tasks. The agent will process and structure it for you.</p>
      </section>

      <form className="card" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="form-label">Title (Optional)</label>
          <input 
            className="text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary..."
            autoFocus
          />
        </div>

        <div>
          <label className="form-label">Raw Text *</label>
          <textarea
            className="textarea-input"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Type your thoughts, tasks, or paste something..."
            rows={5}
            required
            style={{ fontSize: "16px", lineHeight: 1.6 }}
          />
        </div>

        <div>
          <label className="form-label">Source Type (Optional)</label>
          <select 
            className="select-input"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
          >
            {SOURCE_TYPES.map(st => (
              <option key={st} value={st}>{st === "" ? "Auto-detect" : st.charAt(0).toUpperCase() + st.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div style={{ padding: 16, background: "rgba(10, 132, 255, 0.05)", borderRadius: "var(--r-md)", border: "1px dashed rgba(10, 132, 255, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="form-label" style={{ color: "var(--accent-blue)", margin: 0 }}>Agent Processing (v1 Mock Mode)</span>
            <span style={{ fontSize: 11, color: "var(--ink-500)" }}>Awaiting capture...</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-400)" }}>The mock agent will analyze your raw text to suggest Record Type, Bucket, Priority, and Tags once you submit.</p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button 
            className="btn btn-accent" 
            type="submit" 
            disabled={!rawText.trim() || status === "processing"}
          >
            {status === "processing" ? "Processing..." : "Capture & Process"}
          </button>
        </div>
      </form>
    </div>
  );
}
