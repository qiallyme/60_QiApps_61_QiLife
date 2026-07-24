import type { JournalDraft, JournalSaveStatus } from "../types";

interface JournalEditorProps {
  draft: JournalDraft;
  status: JournalSaveStatus;
  onChange: (draft: JournalDraft) => void;
  onSave: () => void;
  onRetry: () => void;
  onExport: () => void;
}

const statusText: Record<JournalSaveStatus, string> = {
  clean: "Saved",
  dirty: "Unsaved changes",
  saving: "Saving…",
  failed: "Save failed",
};

export function JournalEditor({
  draft,
  status,
  onChange,
  onSave,
  onRetry,
  onExport,
}: JournalEditorProps) {
  function patch(values: Partial<JournalDraft>) {
    onChange({ ...draft, ...values });
  }

  return (
    <div className="journal-editor">
      <div className="journal-editor-fields">
        <label>
          Title
          <input
            aria-label="Title"
            value={draft.title}
            onChange={(event) => patch({ title: event.target.value })}
          />
        </label>
        <label>
          Journal date
          <input
            aria-label="Journal date"
            type="date"
            value={draft.entryDate}
            onChange={(event) => patch({ entryDate: event.target.value })}
          />
        </label>
        <label>
          Tags
          <input
            aria-label="Tags"
            value={draft.tags.join(", ")}
            onChange={(event) => patch({
              tags: event.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            })}
          />
        </label>
        <label className="journal-pin">
          <input
            aria-label="Pinned"
            type="checkbox"
            checked={draft.pinned}
            onChange={(event) => patch({ pinned: event.target.checked })}
          />
          Pinned
        </label>
      </div>
      <label>
        Markdown
        <textarea
          aria-label="Markdown"
          rows={20}
          value={draft.bodyMarkdown}
          onChange={(event) => patch({ bodyMarkdown: event.target.value })}
        />
      </label>
      <div className="journal-editor-actions">
        <span role="status">{statusText[status]}</span>
        {status === "failed" && (
          <button type="button" onClick={onRetry}>Retry save</button>
        )}
        <button type="button" onClick={onExport}>Export Markdown</button>
        <button
          className="qilife-btn primary"
          type="button"
          onClick={onSave}
          disabled={status === "saving"}
        >
          Save
        </button>
      </div>
    </div>
  );
}
