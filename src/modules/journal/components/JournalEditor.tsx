import { useId } from "react";
import type { JournalDraft, JournalSaveStatus } from "../types";

interface JournalEditorProps {
  draft: JournalDraft;
  status: JournalSaveStatus;
  cleanStatusText?: string;
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
  cleanStatusText = "Saved",
  onChange,
  onSave,
  onRetry,
  onExport,
}: JournalEditorProps) {
  const fieldId = useId();

  function patch(values: Partial<JournalDraft>) {
    onChange({ ...draft, ...values });
  }

  return (
    <div className="journal-editor">
      <div className="journal-editor-fields">
        <label htmlFor={`${fieldId}-title`}>
          Title
          <input
            id={`${fieldId}-title`}
            name="title"
            aria-label="Title"
            value={draft.title}
            onChange={(event) => patch({ title: event.target.value })}
          />
        </label>
        <label htmlFor={`${fieldId}-entry-date`}>
          Journal date
          <input
            id={`${fieldId}-entry-date`}
            name="entryDate"
            aria-label="Journal date"
            type="date"
            value={draft.entryDate}
            onChange={(event) => patch({ entryDate: event.target.value })}
          />
        </label>
        <label htmlFor={`${fieldId}-tags`}>
          Tags
          <input
            id={`${fieldId}-tags`}
            name="tags"
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
        <label className="journal-pin" htmlFor={`${fieldId}-pinned`}>
          <input
            id={`${fieldId}-pinned`}
            name="pinned"
            aria-label="Pinned"
            type="checkbox"
            checked={draft.pinned}
            onChange={(event) => patch({ pinned: event.target.checked })}
          />
          Pinned
        </label>
      </div>
      <label htmlFor={`${fieldId}-markdown`}>
        Markdown
        <textarea
          id={`${fieldId}-markdown`}
          name="bodyMarkdown"
          aria-label="Markdown"
          rows={20}
          value={draft.bodyMarkdown}
          onChange={(event) => patch({ bodyMarkdown: event.target.value })}
        />
      </label>
      <div className="journal-editor-actions">
        <span role="status">
          {status === "clean" ? cleanStatusText : statusText[status]}
        </span>
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
