// src/features/qilife/components/QuickCaptureModal.tsx

import { useState } from "react";
import { entityRegistry } from "../data/entityRegistry";
import { createRecord } from "../services/qilifeStore";

interface QuickCaptureModalProps {
  defaultEntityKey?: string;
  onClose: () => void;
}

export function QuickCaptureModal({
  defaultEntityKey = "task",
  onClose,
}: QuickCaptureModalProps) {
  const [entityKey, setEntityKey] = useState(defaultEntityKey);
  const [text, setText]           = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const entity = entityRegistry[entityKey];

  async function handleSave() {
    const clean = text.trim();
    if (!clean || !entity) return;

    setSaving(true);
    setError(null);

    try {
      const defaultStatus =
        entity.fields.find((f) => f.key === "status")?.options?.[0] ?? null;

      await createRecord({
        entity_key: entityKey,
        title:      clean,
        status:     defaultStatus,
        data: {
          [entity.titleField]: clean,
          captured_at: new Date().toISOString(),
        },
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSave();
  }

  return (
    <div className="qi-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qi-modal" onKeyDown={handleKeyDown}>
        <div className="qi-modal-header">
          <h3>Quick Capture</h3>
          <button type="button" className="qi-btn-mini" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="qi-label">
          Capture as
          <select value={entityKey} onChange={(e) => setEntityKey(e.target.value)}>
            {Object.values(entityRegistry).map((e) => (
              <option key={e.key} value={e.key}>
                {e.label}
              </option>
            ))}
          </select>
        </label>

        <label className="qi-label">
          What is it?
          <textarea
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dump the thought here. Organize it later."
            rows={5}
          />
        </label>

        {error && <div className="qi-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="qi-actions end">
          <span style={{ fontSize: 11, color: "#68736c", marginRight: "auto" }}>
            ⌘↵ to save
          </span>
          <button type="button" className="qi-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="qi-btn primary"
            onClick={handleSave}
            disabled={saving || !text.trim()}
          >
            {saving ? "Saving…" : "Capture"}
          </button>
        </div>
      </div>
    </div>
  );
}
