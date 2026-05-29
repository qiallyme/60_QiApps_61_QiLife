import { useState } from "react";
import { apiFetch } from "../api/client";
import { useApi } from "../hooks/use-api";
import type { Person } from "../types";
import { StateEmpty, StateLoading, StateError } from "./shared";

type Props = { refreshToken: number };

export function PeoplePage({ refreshToken }: Props) {
  const people = useApi<Person[]>("/api/people", [], refreshToken);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    legal_name: "",
    type: "person",
    relationship: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");

  const visible = people.data.filter(
    (p) =>
      !search ||
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.relationship.toLowerCase().includes(search.toLowerCase())
  );

  async function createPerson() {
    if (!form.display_name.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await apiFetch<Person>("/api/people", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          legal_name: form.legal_name || form.display_name,
          email: form.email || null,
          phone: form.phone || null,
          notes: form.notes || null,
        }),
      });
      setShowCreate(false);
      setForm({ display_name: "", legal_name: "", type: "person", relationship: "", email: "", phone: "", notes: "" });
      people.reload?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="section-tag">People</div>
        <h2>Who is involved and what is the history?</h2>
        <p>Everyone connected to life operations — linked to QiBits, threads, obligations.</p>
      </section>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ flex: 1 }}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="search-input"
              placeholder="Search people…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-accent btn-sm" onClick={() => setShowCreate(true)}>
            + Add Person
          </button>
        </div>

        {people.loading && <StateLoading />}
        {people.error && <StateError message={people.error} />}
        {!people.loading && visible.length === 0 && (
          <StateEmpty icon="◈" text="No people yet. Add someone." />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {visible.map((p) => (
            <div key={p.id} className="person-card">
              <div className="person-avatar">{initials(p.display_name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-700)" }}>{p.display_name}</div>
                {p.legal_name !== p.display_name && (
                  <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{p.legal_name}</div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  <span className="badge badge-type">{p.type}</span>
                  {p.relationship && (
                    <span className="badge badge-bucket">{p.relationship}</span>
                  )}
                  {p.email && <span className="item-sub">{p.email}</span>}
                  {p.phone && <span className="item-sub">{p.phone}</span>}
                </div>
                {p.notes && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--ink-500)", fontStyle: "italic" }}>
                    {p.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Add Person</div>
            <div className="form-grid">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Display Name *</label>
                  <input className="text-input" placeholder="Zai" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} autoFocus />
                </div>
                <div className="form-field">
                  <label className="form-label">Legal Name</label>
                  <input className="text-input" placeholder="Full legal name" value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Type</label>
                  <select className="select-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {["person", "org", "agency", "court", "vendor", "client"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Relationship</label>
                  <input className="text-input" placeholder="friend, vendor…" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="text-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input className="text-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Notes</label>
                <textarea className="textarea-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            {saveError && <div className="error-banner" style={{ marginTop: 12 }}>{saveError}</div>}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving || !form.display_name.trim()} onClick={createPerson}>
                {saving ? "Saving…" : "Add Person"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
