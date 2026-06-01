import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mockIngestion } from "../utils/mock-agent";
import { savePendingDraft } from "../utils/storage";

const SOURCE_TYPES = ["", "note", "care", "finance", "legal", "tech", "task", "other"];

export function CapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rawText, setRawText] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [status, setStatus] = useState<"idle" | "processing">("idle");

  useEffect(() => {
    const state = location.state as { prefill?: string; sourceType?: string } | null;
    if (!state) return;

    if (state.prefill) {
      setRawText(state.prefill);
    }

    if (state.sourceType) {
      setSourceType(state.sourceType);
    }
  }, [location.state]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) return;

    setStatus("processing");

    window.setTimeout(() => {
      const draft = mockIngestion(rawText, sourceType);
      savePendingDraft(draft);
      setStatus("idle");
      navigate("/review");
    }, 250);
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Capture</div>
          <h2>Capture first. Clean up in review.</h2>
          <p>One raw capture should produce a usable draft with type, summary, tags, priority, space, insight, and actions.</p>
        </div>
      </section>

      <form className="card dense-card stack-md" onSubmit={handleSubmit}>
        <div>
          <label className="form-label">Raw capture</label>
          <textarea
            className="textarea-input"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder="What happened? What changed? What needs to happen next?"
            rows={6}
            required
            autoFocus
          />
        </div>

        <div className="two-col">
          <div>
            <label className="form-label">Source hint</label>
            <select className="select-input" value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
              {SOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type ? type.charAt(0).toUpperCase() + type.slice(1) : "Auto-detect"}
                </option>
              ))}
            </select>
          </div>

          <div className="capture-checklist">
            <span className="form-label">Draft will generate</span>
            <div className="stack-xs compact-text">
              <span>Type, title, summary, tags</span>
              <span>Priority, space, insight</span>
              <span>Actions with due hints when found</span>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button className="btn btn-primary" type="submit" disabled={!rawText.trim() || status === "processing"}>
            {status === "processing" ? "Drafting..." : "Draft for Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
