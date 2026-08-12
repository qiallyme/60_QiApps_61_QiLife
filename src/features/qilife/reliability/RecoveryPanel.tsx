import { useId, useRef, useState } from "react";
import { useAuth } from "../components/auth/useAuth";
import {
  listAllRecords,
  restoreRecords,
} from "../services/qilifeStore";
import {
  createRecoveryExport,
  parseRecoveryExport,
  previewRecoveryRestore,
  recoveryFileName,
  restoreRecoveryExport,
  type QiLifeRecoveryExport,
  type RestorePreview,
  type RestoreResult,
} from "./recoveryService";
import { useStorageStatus } from "./storageStatus";

function downloadJson(exported: QiLifeRecoveryExport) {
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = recoveryFileName();
  anchor.click();
  URL.revokeObjectURL(url);
}

export function RecoveryPanel({ onClose }: { onClose: () => void }) {
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const storage = useStorageStatus();
  const [selected, setSelected] = useState<QiLifeRecoveryExport | null>(null);
  const [preview, setPreview] = useState<RestorePreview | null>(null);
  const [result, setResult] = useState<RestoreResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    setError("");
    try {
      const records = await listAllRecords({ includeArchived: true });
      downloadJson(createRecoveryExport({ records, userId: user?.id }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const parsed = parseRecoveryExport(await file.text());
      const existing = await listAllRecords({ includeArchived: true });
      setSelected(parsed);
      setPreview(previewRecoveryRestore(parsed.records, existing));
    } catch (cause) {
      setSelected(null);
      setPreview(null);
      setError(cause instanceof Error ? cause.message : "Restore file could not be read.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRestore() {
    if (!selected || !preview) return;
    setBusy(true);
    setError("");
    try {
      const restored = await restoreRecoveryExport(selected, restoreRecords);
      setResult(restored);
      const existing = await listAllRecords({ includeArchived: true });
      setPreview(previewRecoveryRestore(selected.records, existing));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Restore failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qilife-modal-backdrop" role="presentation">
      <section
        className="qilife-modal reliability-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-title`}
      >
        <header className="qilife-modal-header">
          <div>
            <div className={`qilife-store-pill storage-${storage.kind}`}>
              <strong>{storage.kind === "sync_error" ? "Sync error" : `${storage.kind[0].toUpperCase()}${storage.kind.slice(1)}`}</strong>
              <span>{storage.detail}</span>
            </div>
            <h2 id={`${fieldId}-title`}>Data recovery</h2>
          </div>
          <button type="button" className="qilife-icon-btn" onClick={onClose} aria-label="Close recovery tools">×</button>
        </header>

        <div className="reliability-section">
          <h3>Complete JSON export</h3>
          <p>Downloads every active and archived QiRecord, including IDs, relationships, timestamps, Journal Markdown, and raw capture.</p>
          <button type="button" className="qilife-btn primary" disabled={busy} onClick={() => void handleExport()}>
            Export all QiLife data
          </button>
        </div>

        <div className="reliability-section">
          <h3>Reviewed restore</h3>
          <p>Select a QiLife recovery JSON file. Nothing changes until the preview is reviewed and Restore is selected.</p>
          <label className="qilife-btn" htmlFor={`${fieldId}-restore-file`}>Choose recovery file</label>
          <input
            ref={inputRef}
            id={`${fieldId}-restore-file`}
            name="recoveryFile"
            className="qilife-sr-only"
            type="file"
            accept="application/json,.json"
            disabled={busy}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />

          {selected?.user_id && user?.id && selected.user_id !== user.id && (
            <div className="qilife-warning" role="alert">
              This export was created for a different user identifier. Review carefully before restoring.
            </div>
          )}

          {preview && (
            <div className="restore-preview">
              <h4>Restore preview</h4>
              <dl>
                <div><dt>Total</dt><dd>{preview.total}</dd></div>
                <div><dt>Create</dt><dd>{preview.create}</dd></div>
                <div><dt>Update</dt><dd>{preview.update}</dd></div>
                <div><dt>Already current</dt><dd>{preview.skip}</dd></div>
                <div><dt>Newer existing records</dt><dd>{preview.newerConflict}</dd></div>
              </dl>
              <ul>
                {Object.entries(preview.byEntity).map(([entity, count]) => (
                  <li key={entity}><span>{entity}</span><strong>{count}</strong></li>
                ))}
              </ul>
              <div className="qilife-actions">
                <button type="button" className="qilife-btn" onClick={() => {
                  setSelected(null);
                  setPreview(null);
                }}>Cancel</button>
                <button type="button" className="qilife-btn primary" disabled={busy} onClick={() => void handleRestore()}>
                  Restore reviewed records
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="qilife-success" role="status">
              Restore finished: {result.created} created, {result.updated} updated, {result.skipped} skipped, {result.failed} failed.
              {result.failures.length > 0 && (
                <ul>
                  {result.failures.map((failure) => (
                    <li key={failure.id}>{failure.id}: {failure.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {error && <div className="qilife-error" role="alert">{error}</div>}
        </div>
      </section>
    </div>
  );
}
