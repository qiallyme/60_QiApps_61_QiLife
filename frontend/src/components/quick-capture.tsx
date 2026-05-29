import { FormEvent, useState } from "react";
import { apiFetch } from "../api/client";
import type { Qibit } from "../types";

type QuickCaptureProps = { onCaptured: () => void };

type StatusKind = "idle" | "saving" | "ok" | "error";

export function QuickCapture({ onCaptured }: QuickCaptureProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<StatusKind>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || status === "saving") return;

    setStatus("saving");
    setMessage("");

    try {
      await apiFetch<Qibit>("/api/qibits/capture", {
        method: "POST",
        body: JSON.stringify({ raw_capture: trimmed }),
      });
      setValue("");
      setStatus("ok");
      setMessage("QiBit dropped into Inbox ✓");
      onCaptured();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Capture failed.");
    }
  }

  const statusClass =
    status === "ok" ? "success" : status === "error" ? "error" : "";

  return (
    <form className="quick-capture" onSubmit={handleSubmit}>
      <div className="qc-label">What happened?</div>
      <textarea
        id="quick-capture-input"
        className="qc-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Zai owes me $40 for gas. Need to follow up…"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <div className="qc-row">
        <span className={`qc-status ${statusClass}`}>
          {status === "saving"
            ? "Saving…"
            : message || "Capture what happened. ⌘↵ to send."}
        </span>
        <button
          className="btn btn-accent btn-sm"
          type="submit"
          disabled={status === "saving" || !value.trim()}
        >
          {status === "saving" ? (
            <>
              <span className="spinner" style={{ borderTopColor: "#0d2612" }} />
              Capturing…
            </>
          ) : (
            "Capture QiBit"
          )}
        </button>
      </div>
    </form>
  );
}
