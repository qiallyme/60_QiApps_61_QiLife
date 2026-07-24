import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { JournalCalendar } from "./components/JournalCalendar";
import { JournalEditor } from "./components/JournalEditor";
import { JournalFilters } from "./components/JournalFilters";
import { JournalList } from "./components/JournalList";
import { JournalNavigationGuard } from "./components/JournalNavigationGuard";
import { JournalNotFound } from "./components/JournalNotFound";
import { useJournalEntries } from "./hooks/useJournalEntries";
import { useJournalEntry } from "./hooks/useJournalEntry";
import { useSerializedJournalSave } from "./hooks/useSerializedJournalSave";
import { filterJournalEntries, type JournalFilters as JournalFilterValues } from "./services/journalSearch";
import { journalRepository } from "./services/journalRepository";
import { downloadJournalMarkdown } from "./services/markdownExport";
import type { JournalDraft, JournalEntry, JournalSaveStatus } from "./types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function draftFromEntry(entry: JournalEntry): JournalDraft {
  return {
    title: entry.title,
    entryDate: entry.entryDate,
    bodyMarkdown: entry.bodyMarkdown,
    tags: entry.tags,
    pinned: entry.pinned,
  };
}

export function JournalIndexRoute() {
  const { entries, loading, error } = useJournalEntries(journalRepository);
  const [filters, setFilters] = useState<JournalFilterValues>({
    query: "",
    tag: null,
    entryDate: null,
  });
  const tags = useMemo(
    () => [...new Set(entries.flatMap((entry) => entry.tags))].sort(),
    [entries],
  );
  const visibleEntries = useMemo(
    () => filterJournalEntries(entries, filters),
    [entries, filters],
  );

  return (
    <main className="qilife-page">
      <header className="qilife-page-header">
        <div>
          <div className="qilife-eyebrow">LIFE RECORD</div>
          <h1>Journal</h1>
        </div>
        <Link className="qilife-btn primary" to="/journal/new">New entry</Link>
      </header>
      {loading && <div className="qilife-empty">Loading journal…</div>}
      {error && <div className="qilife-error">{error}</div>}
      {!loading && !error && entries.length === 0 ? (
        <div className="qilife-empty">No journal entries yet.</div>
      ) : !loading && !error ? (
        <>
          <div className="journal-filter-row">
            <JournalFilters filters={filters} tags={tags} onChange={setFilters} />
            <JournalCalendar
              entryDate={filters.entryDate}
              onChange={(entryDate) => setFilters((current) => ({ ...current, entryDate }))}
            />
          </div>
          <JournalList entries={visibleEntries} />
        </>
      ) : null}
    </main>
  );
}

export function JournalNewRoute() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<JournalDraft>({
    title: "",
    entryDate: today(),
    bodyMarkdown: "",
    tags: [],
    pinned: false,
  });
  const [status, setStatus] = useState<JournalSaveStatus>("clean");

  async function create() {
    setStatus("saving");
    try {
      const entry = await journalRepository.create(draft);
      setStatus("clean");
      navigate(`/journal/${entry.id}`, { replace: true });
    } catch {
      setStatus("failed");
    }
  }

  return (
    <main className="qilife-page">
      <h1>New journal entry</h1>
      <JournalEditor
        draft={draft}
        status={status}
        onChange={(next) => {
          setDraft(next);
          setStatus("dirty");
        }}
        onSave={() => void create()}
        onRetry={() => void create()}
        onExport={() => undefined}
      />
    </main>
  );
}

export function JournalEntryRoute() {
  const { id = "" } = useParams();
  const { entry, error, setEntry } = useJournalEntry(journalRepository, id);
  const [draft, setDraft] = useState<JournalDraft | null>(null);

  const persist = useCallback(async (next: JournalDraft) => {
    const saved = await journalRepository.update(id, next);
    setEntry(saved);
  }, [id, setEntry]);
  const saveQueue = useSerializedJournalSave(persist);

  useEffect(() => {
    if (entry) setDraft(draftFromEntry(entry));
  }, [entry]);

  if (entry === undefined && !error) {
    return <main className="qilife-page"><div className="qilife-empty">Loading entry…</div></main>;
  }

  if (!entry || error) {
    return <JournalNotFound message={error ?? undefined} />;
  }

  return (
    <main className="qilife-page">
      <h1>{entry.title}</h1>
      {draft && (
        <JournalEditor
          draft={draft}
          status={saveQueue.status}
          onChange={(next) => {
            setDraft(next);
            saveQueue.queue(next);
          }}
          onSave={() => void saveQueue.flush()}
          onRetry={() => void saveQueue.retry()}
          onExport={() => downloadJournalMarkdown({ ...entry, ...draft })}
        />
      )}
      <JournalNavigationGuard
        active={saveQueue.hasUnsafeNavigation}
        failed={saveQueue.status === "failed"}
        onRetry={() => void saveQueue.retry()}
      />
    </main>
  );
}
