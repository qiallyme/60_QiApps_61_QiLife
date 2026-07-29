import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { QiRecord } from "../../features/qilife/types";
import { maskIdentifier } from "../objects/identifierPolicy";
import { objectRegistryRepository } from "../objects/services/objectRegistryRepository";
import { filterSoftware, softwareAttentionState } from "./services/softwareFilters";
import {
  draftFromSoftwareRecord,
  emptySoftwareDraft,
  softwareRepository,
} from "./services/softwareRepository";
import type { SoftwareDraft, SoftwareFilters } from "./types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function value(record: QiRecord, key: string) {
  return typeof record.data[key] === "string" ? String(record.data[key]) : "";
}

function SoftwareForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: SoftwareDraft;
  onSave: (draft: SoftwareDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof SoftwareDraft>(key: K, next: SoftwareDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: next }));
  const fields: Array<[keyof SoftwareDraft, string, "text" | "url" | "date" | "textarea"]> = [
    ["provider", "Provider/software name", "text"],
    ["title", "Account title", "text"],
    ["description", "Description", "textarea"],
    ["loginEmail", "Login email", "text"],
    ["username", "Username", "text"],
    ["primaryUrl", "Primary URL", "url"],
    ["adminUrl", "Admin URL", "url"],
    ["plan", "Plan", "text"],
    ["billingCadence", "Billing cadence", "text"],
    ["renewalDate", "Renewal date", "date"],
    ["ownerAdministrator", "Owner/administrator", "text"],
    ["organizationWorkspace", "Organization/workspace", "text"],
    ["supportContact", "Support contact", "text"],
    ["notes", "Notes", "textarea"],
    ["lastVerifiedAt", "Last verified date", "date"],
  ];
  return (
    <form
      className="software-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        onSave(draft).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to save.")).finally(() => setSaving(false));
      }}
    >
      <div className="qilife-form-grid">
        {fields.map(([key, label, type]) => (
          <label className={type === "textarea" ? "wide" : ""} key={key}>
            <span>{label}</span>
            {type === "textarea"
              ? <textarea value={String(draft[key])} onChange={(event) => set(key, event.target.value as never)} />
              : <input required={key === "provider" || key === "title"} type={type} value={String(draft[key])} onChange={(event) => set(key, event.target.value as never)} />}
          </label>
        ))}
        <label><span>Status</span><select value={draft.status} onChange={(event) => set("status", event.target.value)}>
          {["active", "trial", "paused", "cancelled"].map((status) => <option key={status}>{status}</option>)}
        </select></label>
        <label><span>Sensitivity</span><select value={draft.sensitivity} onChange={(event) => set("sensitivity", event.target.value as SoftwareDraft["sensitivity"])}>
          {["public", "private", "sensitive", "restricted"].map((sensitivity) => <option key={sensitivity}>{sensitivity}</option>)}
        </select></label>
      </div>
      {error && <div className="qilife-error" role="alert">{error}</div>}
      <div className="qilife-form-actions">
        <button className="qilife-btn quiet" type="button" onClick={onCancel}>Cancel</button>
        <button className="qilife-btn primary" disabled={saving} type="submit">{saving ? "Saving…" : "Save Software & Service"}</button>
      </div>
    </form>
  );
}

export function SoftwareIndexRoute() {
  const [records, setRecords] = useState<QiRecord[]>([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<SoftwareFilters>({
    query: "", provider: "", status: "", renewal: "", verification: "",
    includeArchived: false, today: today(),
  });
  useEffect(() => {
    softwareRepository.list(true).then(setRecords).catch((cause) =>
      setError(cause instanceof Error ? cause.message : "Unable to load Software & Services."));
  }, []);
  const providers = [...new Set(records.map((record) => value(record, "provider")).filter(Boolean))].sort();
  const visible = useMemo(() => filterSoftware(records, filters), [records, filters]);
  return (
    <main className="qilife-page software-page">
      <header className="qilife-page-header">
        <div><div className="qilife-eyebrow">OBJECT REGISTRY</div><h1>Software & Services</h1><p>Accounts, subscriptions, identifiers, evidence, and verification.</p></div>
        <Link className="qilife-btn primary" to="/software/new">Add software</Link>
      </header>
      <section className="qilife-filter-row" aria-label="Software filters">
        <input aria-label="Search Software & Services" placeholder="Search software…" value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
        <select aria-label="Provider" value={filters.provider} onChange={(e) => setFilters({ ...filters, provider: e.target.value })}><option value="">All providers</option>{providers.map((provider) => <option key={provider}>{provider}</option>)}</select>
        <select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option>{["active", "trial", "paused", "cancelled"].map((status) => <option key={status}>{status}</option>)}</select>
        <select aria-label="Renewal state" value={filters.renewal} onChange={(e) => setFilters({ ...filters, renewal: e.target.value as SoftwareFilters["renewal"] })}><option value="">Any renewal</option><option value="approaching">Approaching</option><option value="overdue">Overdue</option><option value="none">No renewal</option></select>
        <select aria-label="Verification state" value={filters.verification} onChange={(e) => setFilters({ ...filters, verification: e.target.value as SoftwareFilters["verification"] })}><option value="">Any verification</option><option value="recent">Recently verified</option><option value="needs_verification">Needs verification</option></select>
        <label className="qilife-check"><input type="checkbox" checked={filters.includeArchived} onChange={(e) => setFilters({ ...filters, includeArchived: e.target.checked })} />Archived</label>
      </section>
      {error && <div className="qilife-error" role="alert">{error}</div>}
      {!error && visible.length === 0 && <div className="qilife-empty"><h2>No matching software</h2><p>Add a service or adjust the filters.</p></div>}
      <div className="software-list" aria-label="Software & Services">
        {visible.map((record) => {
          const attention = softwareAttentionState(record, filters.today);
          return <Link className="software-card" key={record.id} to={`/software/${record.id}`}>
            <div><strong>{record.title}</strong><span>{value(record, "provider")}</span></div>
            <div className="software-card-status"><span>{record.status}</span>{attention.renewal === "approaching" && <span>Renewal approaching</span>}{attention.verification === "stale" && <span>Needs verification</span>}</div>
            <small>{value(record, "description") || "No description yet."}</small>
          </Link>;
        })}
      </div>
    </main>
  );
}

async function addLoginIdentifiers(objectId: string, draft: SoftwareDraft) {
  const common = { objectId, provider: draft.provider, isPrimary: false, isSensitive: true, verifiedAt: draft.lastVerifiedAt || null, sourceRecordId: null };
  if (draft.loginEmail) await objectRegistryRepository.addIdentifier({ ...common, identifierType: "login_email", identifierValue: draft.loginEmail, displayValue: "Login email" });
  if (draft.username) await objectRegistryRepository.addIdentifier({ ...common, identifierType: "username", identifierValue: draft.username, displayValue: "Username" });
}

export function SoftwareNewRoute() {
  const navigate = useNavigate();
  return <main className="qilife-page"><h1>New Software & Service</h1><SoftwareForm initial={emptySoftwareDraft} onCancel={() => navigate("/software")} onSave={async (draft) => {
    const record = await softwareRepository.create(draft);
    await addLoginIdentifiers(record.id, draft);
    navigate(`/software/${record.id}`, { replace: true });
  }} /></main>;
}

function useSoftware(id: string) {
  const [record, setRecord] = useState<QiRecord | null | undefined>();
  useEffect(() => { softwareRepository.get(id).then(setRecord); }, [id]);
  return [record, setRecord] as const;
}

export function SoftwareEditRoute() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [record] = useSoftware(id);
  if (record === undefined) return <main className="qilife-page"><div className="qilife-empty">Loading software…</div></main>;
  if (!record) return <main className="qilife-page"><div className="qilife-error">Software record not found.</div></main>;
  return <main className="qilife-page"><h1>Edit {record.title}</h1><SoftwareForm initial={draftFromSoftwareRecord(record)} onCancel={() => navigate(`/software/${id}`)} onSave={async (draft) => {
    await softwareRepository.update(id, draft);
    navigate(`/software/${id}`, { replace: true });
  }} /></main>;
}

export function SoftwareDetailRoute() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useSoftware(id);
  const [identifiers, setIdentifiers] = useState<QiRecord[]>([]);
  const [history, setHistory] = useState<QiRecord[]>([]);
  const [relationships, setRelationships] = useState<QiRecord[]>([]);
  const [secrets, setSecrets] = useState<QiRecord[]>([]);
  useEffect(() => {
    Promise.all([
      objectRegistryRepository.listIdentifiers(id),
      objectRegistryRepository.listRecords(id),
      objectRegistryRepository.listRelationships(id),
      objectRegistryRepository.listSecretReferences(id),
    ]).then(([nextIdentifiers, nextHistory, nextRelationships, nextSecrets]) => {
      setIdentifiers(nextIdentifiers); setHistory(nextHistory); setRelationships(nextRelationships); setSecrets(nextSecrets);
    });
  }, [id]);
  if (record === undefined) return <main className="qilife-page"><div className="qilife-empty">Loading software…</div></main>;
  if (!record) return <main className="qilife-page"><div className="qilife-error">Software record not found or inaccessible.</div><Link to="/software">Back to Software</Link></main>;
  return (
    <main className="qilife-page software-detail">
      <header className="qilife-page-header"><div><div className="qilife-eyebrow">{value(record, "provider") || "SOFTWARE"}</div><h1>{record.title}</h1><p>{value(record, "description")}</p></div><div className="qilife-page-actions"><Link className="qilife-btn" to={`/software/${id}/edit`}>Edit</Link><Link className="qilife-btn" to={`/software/${id}/history`}>History</Link></div></header>
      <section className="qilife-panel"><h2>Object identity</h2><dl className="software-facts"><div><dt>Status</dt><dd>{record.status}</dd></div><div><dt>Plan</dt><dd>{value(record, "plan") || "Not recorded"}</dd></div><div><dt>Renewal</dt><dd>{value(record, "renewal_date") || "Not recorded"}</dd></div><div><dt>Last verified</dt><dd>{value(record, "last_verified_at") || "Needs verification"}</dd></div><div><dt>Internal ID</dt><dd className="long-id">{record.id}</dd></div></dl></section>
      <section className="qilife-panel"><h2>Important identifiers</h2>{identifiers.length === 0 ? <p>No identifiers recorded.</p> : identifiers.map((item) => <div className="identifier-row" key={item.id}><strong>{String(item.data.display_value || item.data.identifier_type)}</strong><span>{item.data.is_sensitive ? maskIdentifier(String(item.data.identifier_value)) : String(item.data.identifier_value)}</span></div>)}</section>
      <section className="qilife-panel"><h2>Relationships and evidence</h2><p>{relationships.length} related objects · {history.length} history records · {secrets.length} secret-storage references</p></section>
      <div className="qilife-page-actions"><button className="qilife-btn" type="button" onClick={() => softwareRepository.markVerified(record).then(setRecord)}>Mark verified</button><button className="qilife-btn danger" type="button" onClick={() => softwareRepository.archive(id).then(() => navigate("/software"))}>Archive</button></div>
    </main>
  );
}

export function SoftwareHistoryRoute() {
  const { id = "" } = useParams();
  const [record] = useSoftware(id);
  const [history, setHistory] = useState<QiRecord[]>([]);
  useEffect(() => { objectRegistryRepository.listRecords(id).then(setHistory); }, [id]);
  return <main className="qilife-page"><header className="qilife-page-header"><div><div className="qilife-eyebrow">OBJECT HISTORY</div><h1>{record?.title ?? "Software history"}</h1></div><Link to={`/software/${id}`}>Back to detail</Link></header>{history.length === 0 ? <div className="qilife-empty">No history records yet. Add a note, support request, or verification record from the detail page.</div> : history.map((item) => <article className="qilife-panel" key={item.id}><h2>{item.title}</h2><p>{String(item.data.raw_capture ?? "")}</p><small>{String(item.data.occurred_at ?? "")}</small></article>)}</main>;
}
