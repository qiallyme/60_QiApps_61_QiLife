import { useState } from "react";
import { entityRegistry } from "../data/entityRegistry";
import { createRecord } from "../services/qilifeStore";

interface QuickCaptureModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const CAPTURE_KEYS = ["qibit", "task", "event", "journal_entry", "person", "document"];

export function QuickCaptureModal({ onClose, onSaved }: QuickCaptureModalProps) {
  const [entityKey, setEntityKey] = useState("qibit");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const clean = text.trim();
    if (!clean) {
      setError("Capture text is required.");
      return;
    }

    const entity = entityRegistry[entityKey];
    const statusField = entity.fields.find((field) => field.key === "status");
    const defaultStatus = statusField?.options?.[0] || null;

    try {
      setSaving(true);
      setError(null);
      await createRecord({
        entity_key: entityKey,
        title: clean,
        status: defaultStatus,
        data: {
          [entity.titleField]: clean,
          notes,
          raw_content: entityKey === "qibit" ? notes || clean : undefined,
          captured_at: new Date().toISOString()
        }
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Capture failed.");
      setSaving(false);
    }
  }

  return (
    <div className="qilife-modal-backdrop">
      <div className="qilife-modal capture-modal">
        <div className="qilife-modal-header">
          <div>
            <div className="qilife-eyebrow">CAPTURE FIRST</div>
            <h2>Get it out of your head.</h2>
          </div>
          <button className="qilife-mini-btn" type="button" onClick={onClose}>Close</button>
        </div>

        {error && <div className="qilife-error compact">{error}</div>}

        <label className="qilife-label">
          What is it?
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void handleSave();
            }}
            placeholder="Dump the thought. Sort later."
            autoFocus
          />
        </label>

        <div className="qilife-capture-types" role="group" aria-label="Capture type">
          {CAPTURE_KEYS.map((key) => {
            const entity = entityRegistry[key];
            return (
              <button
                key={key}
                type="button"
                className={entityKey === key ? "active" : ""}
                onClick={() => setEntityKey(key)}
              >
                <span>{entity.icon}</span>{entity.label}
              </button>
            );
          })}
        </div>

        <label className="qilife-label">
          Context <span className="qilife-optional">optional</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Links, people, why it matters, next action..."
            rows={4}
          />
        </label>

        <div className="qilife-actions end modal-actions">
          <span className="qilife-shortcut-hint">Ctrl/⌘ + Enter</span>
          <button className="qilife-btn primary" type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : entityKey === "qibit" ? "Send to Inbox" : `Create ${entityRegistry[entityKey].label}`}
          </button>
        </div>
      </div>
    </div>
  );
}
