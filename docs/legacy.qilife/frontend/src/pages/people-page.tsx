import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPersonOnBackend } from "../api/client";
import type { Person } from "../types";
import { getPeople, savePerson } from "../utils/storage";
import { StateEmpty } from "./shared";

type Props = {
  refreshToken: number;
};

export function PeoplePage({ refreshToken }: Props) {
  const [people, setPeople] = useState<Person[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    legal_name: "",
    type: "person",
    relationship: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPeople(getPeople());
  }, [refreshToken]);

  const visible = useMemo(
    () =>
      people.filter((person) => {
        if (!search.trim()) return true;
        const query = search.trim().toLowerCase();
        return (
          person.display_name.toLowerCase().includes(query) ||
          person.legal_name.toLowerCase().includes(query) ||
          person.relationship.toLowerCase().includes(query) ||
          person.type.toLowerCase().includes(query)
        );
      }),
    [people, search],
  );

  async function createPerson() {
    if (!form.display_name.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      let nextPerson: Person;
      try {
        nextPerson = await createPersonOnBackend({
          ...form,
          display_name: form.display_name.trim(),
          legal_name: form.legal_name.trim() || form.display_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
        });
      } catch {
        nextPerson = {
          id: crypto.randomUUID(),
          display_name: form.display_name.trim(),
          legal_name: form.legal_name.trim() || form.display_name.trim(),
          relationship: form.relationship.trim(),
          type: form.type,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
          tags_json: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      savePerson(nextPerson);
      setPeople(getPeople());
      setShowCreate(false);
      setForm({ display_name: "", legal_name: "", type: "person", relationship: "", email: "", phone: "", address: "", notes: "" });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  function initials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div className="stack-sm">
          <div className="section-tag">People</div>
          <h2>Who is involved and what links back to them?</h2>
          <p>People records stay lightweight, but they now open into actual detail views and can persist in backend or fallback mode.</p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={() => setShowCreate(true)}>
          + Add Person
        </button>
      </section>

      <div className="card dense-card stack-md">
        <div className="card-header">
          <div className="search-wrap" style={{ flex: 1 }}>
            <input
              className="search-input"
              placeholder="Search people"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <StateEmpty icon="◈" text="No people yet. Add the people involved in current work." />
        ) : (
          <div className="stack-sm">
            {visible.map((person) => (
              <Link key={person.id} to={`/people/${person.id}`} className="person-card record-row-link">
                <div className="person-avatar">{initials(person.display_name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="compact-row spread">
                    <strong>{person.display_name}</strong>
                    <span className="badge badge-type">{person.type}</span>
                  </div>
                  {person.legal_name !== person.display_name ? (
                    <div className="compact-text">{person.legal_name}</div>
                  ) : null}
                  <div className="item-meta" style={{ marginTop: 6 }}>
                    {person.relationship ? <span className="badge badge-bucket">{person.relationship}</span> : null}
                    {person.email ? <span className="item-sub">{person.email}</span> : null}
                    {person.phone ? <span className="item-sub">{person.phone}</span> : null}
                  </div>
                  {person.notes ? <div className="compact-text" style={{ marginTop: 6 }}>{person.notes}</div> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-title">Add Person</div>
            <div className="form-grid">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Display Name *</label>
                  <input className="text-input" value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} autoFocus />
                </div>
                <div className="form-field">
                  <label className="form-label">Legal Name</label>
                  <input className="text-input" value={form.legal_name} onChange={(event) => setForm({ ...form, legal_name: event.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Type</label>
                  <select className="select-input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                    {["person", "org", "agency", "court", "vendor", "client"].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Relationship</label>
                  <input className="text-input" value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="text-input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input className="text-input" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Address</label>
                <input className="text-input" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label">Notes</label>
                <textarea className="textarea-input" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </div>
            </div>
            {saveError ? <div className="error-banner" style={{ marginTop: 12 }}>{saveError}</div> : null}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={saving || !form.display_name.trim()} onClick={createPerson}>
                {saving ? "Saving..." : "Add Person"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
