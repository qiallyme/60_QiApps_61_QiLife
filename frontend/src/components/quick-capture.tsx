import { FormEvent, startTransition, useState } from "react";

import { apiFetch } from "../api/client";
import type { Qibit } from "../types";

type QuickCaptureProps = {
  onCaptured: () => void;
};

export function QuickCapture({ onCaptured }: QuickCaptureProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("Capture what happened.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("Saving QiBit...");

    try {
      await apiFetch<Qibit>("/api/qibits/capture", {
        method: "POST",
        body: JSON.stringify({ raw_capture: trimmed }),
      });
      setValue("");
      setMessage("QiBit captured into Inbox.");
      startTransition(() => {
        onCaptured();
      });
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Capture failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="quick-capture" onSubmit={handleSubmit}>
      <label className="quick-capture-label" htmlFor="quick-capture-input">
        What happened?
      </label>
      <textarea
        id="quick-capture-input"
        className="quick-capture-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Zai owes me $40 for gas. Need to follow up."
        rows={2}
      />
      <div className="quick-capture-actions">
        <span className="quick-capture-status">{message}</span>
        <button className="primary-button" disabled={submitting || !value.trim()} type="submit">
          {submitting ? "Capturing..." : "Capture QiBit"}
        </button>
      </div>
    </form>
  );
}
