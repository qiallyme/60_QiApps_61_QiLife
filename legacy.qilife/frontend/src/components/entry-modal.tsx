import { useState } from "react";
import { TimelineRow } from "../types";
import { updateTimelineItem, deleteTimelineItem } from "../utils/storage";

type Props = {
  entry: TimelineRow;
  onClose: () => void;
  onSaved: () => void;
};

export function EntryModal({ entry, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(entry.title);
  const [bucket, setBucket] = useState(entry.bucket_code);
  const [summary, setSummary] = useState<string>((entry.payload?.summary as string) || "");
  const [rawText, setRawText] = useState<string>((entry.payload?.raw_text as string) || "");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateTimelineItem(entry.id, {
      title,
      bucket_code: bucket,
      payload: { ...entry.payload, summary, raw_text: rawText },
    });
    onSaved();
  }

  function handleDelete() {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteTimelineItem(entry.id);
      onSaved();
    }
  }

  return (
    <div className="modal-overlay" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div className="card" style={{ width: 500, maxWidth: "90vw", background: "var(--bg-800)", border: "1px solid var(--bg-600)" }}>
        <h3 style={{ marginBottom: 16 }}>Edit Entry</h3>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="form-label">Title</label>
            <input className="text-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Bucket</label>
            <select className="select-input" value={bucket} onChange={e => setBucket(e.target.value)}>
              <option value="inbox">Inbox</option>
              <option value="projects">Projects</option>
              <option value="areas">Areas</option>
              <option value="resources">Resources</option>
              <option value="archive">Archive</option>
            </select>
          </div>
          <div>
            <label className="form-label">Summary</label>
            <textarea className="textarea-input" value={summary} onChange={e => setSummary(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="form-label">Raw Text</label>
            <textarea className="textarea-input" value={rawText} onChange={e => setRawText(e.target.value)} rows={4} />
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button type="button" className="btn btn-outline" style={{ color: "var(--status-waiting)", borderColor: "rgba(255,55,95,0.3)" }} onClick={handleDelete}>Delete</button>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
