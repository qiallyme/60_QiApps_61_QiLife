import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import { Action, Draft, Person, Priority, QiBit, QiBitType, Thread } from "../types";
import { saveReviewToBackend } from "../api/client";
import { clearPendingDraft, getPendingDraft, getPeople, getQiBitById, getThreads, persistReviewResult } from "../utils/storage";
import { StateEmpty } from "./shared";

const TYPE_OPTIONS: Array<{ value: QiBitType; label: string }> = [
  { value: "care", label: "Care" },
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal" },
  { value: "tech", label: "Tech" },
  { value: "task", label: "Task" },
  { value: "note", label: "Note" },
];

const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];

type ReviewAction = Action & { kept: boolean };

type SaveResult = {
  qibit: QiBit;
  actionCount: number;
  mode: "backend" | "local";
};

export function ReviewPage() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<QiBitType>("note");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [space, setSpace] = useState("General");
  const [threadId, setThreadId] = useState("");
  const [futureSlot, setFutureSlot] = useState("this_week");
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([]);
  const [actions, setActions] = useState<ReviewAction[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");

  useEffect(() => {
    setThreads(getThreads());
    setPeople(getPeople());
    const pending = getPendingDraft();
    if (!pending) return;

    setDraft(pending);
    setTitle(pending.agentDraft.suggestedTitle);
    setType(pending.agentDraft.suggestedType);
    setSummary(pending.agentDraft.suggestedSummary);
    setTags(pending.agentDraft.suggestedTags.join(", "));
    setPriority(pending.agentDraft.suggestedPriority);
    setSpace(pending.agentDraft.suggestedSpace);
    const existingQiBit = getQiBitById(pending.id);
    setThreadId(existingQiBit?.thread_id ?? "");
    setFutureSlot(existingQiBit?.future_slot ?? "this_week");
    setSelectedPeopleIds(existingQiBit?.peopleIds ?? []);
    setActions(pending.agentDraft.actions.map((action) => ({ ...action, kept: true })));
  }, []);

  function togglePerson(personId: string) {
    setSelectedPeopleIds((current) =>
      current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId],
    );
  }

  function toggleAction(id: string) {
    setActions((current) => current.map((action) => (action.id === id ? { ...action, kept: !action.kept } : action)));
  }

  function updateActionField(id: string, updates: Partial<ReviewAction>) {
    setActions((current) => current.map((action) => (action.id === id ? { ...action, ...updates } : action)));
  }

  function handleDiscard() {
    clearPendingDraft();
    setDraft(null);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (saveState === "saving") return;

    setSaveState("saving");
    const now = new Date().toISOString();
    const finalQiBit: QiBit = {
      id: draft.id,
      createdAt: draft.createdAt,
      updatedAt: now,
      type,
      title: title.trim() || draft.agentDraft.suggestedTitle,
      summary: summary.trim() || draft.agentDraft.suggestedSummary,
      rawText: draft.rawText,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      priority,
      status: "saved",
      space: space.trim() || draft.agentDraft.suggestedSpace,
      agentDraft: draft.agentDraft,
      insight: draft.agentDraft.insight,
      source: draft.source,
      thread_id: threadId || null,
      future_slot: futureSlot,
      peopleIds: selectedPeopleIds,
      linkedPeople: people.filter((person) => selectedPeopleIds.includes(person.id)),
    };

    const acceptedActions = actions
      .filter((action) => action.kept && action.title.trim())
      .map(({ kept, ...action }) => ({
        ...action,
        qibitId: finalQiBit.id,
        thread_id: threadId || null,
        sourceText: draft.rawText,
        priority: action.priority || priority,
      }));

    try {
      const response = await saveReviewToBackend({
        qibit: finalQiBit,
        agentDraft: draft.agentDraft,
        acceptedActions,
        timeline: {
          title: finalQiBit.title,
          summary: finalQiBit.summary,
          type: finalQiBit.type,
          priority: finalQiBit.priority,
          tags: finalQiBit.tags,
          space: finalQiBit.space,
          thread_id: finalQiBit.thread_id,
          future_slot: finalQiBit.future_slot,
          peopleIds: finalQiBit.peopleIds,
          linkedPeople: finalQiBit.linkedPeople?.map((person) => ({
            id: person.id,
            display_name: person.display_name,
            relationship: person.relationship,
            type: person.type,
          })),
          createdAt: finalQiBit.createdAt,
          linkedActions: acceptedActions.map((action) => ({
            id: action.id,
            title: action.title,
            status: action.status,
            priority: action.priority,
            dueHint: action.dueHint,
          })),
          insight: finalQiBit.insight,
        },
      });

      persistReviewResult(response.qibit, response.actions, response.timelineItem);
      setSaveResult({ qibit: response.qibit, actionCount: response.actions.length, mode: "backend" });
      setDraft(null);
    } catch (error) {
      console.warn("Review save falling back to local storage.", error);
      persistReviewResult(finalQiBit, acceptedActions);
      setSaveResult({ qibit: finalQiBit, actionCount: acceptedActions.length, mode: "local" });
      setDraft(null);
    } finally {
      setSaveState("idle");
    }
  }

  if (saveResult) {
    return (
      <div className="page-stack">
        <section className="desk-banner">
          <div>
            <div className="section-tag subdued">Saved</div>
            <h2>{saveResult.qibit.title}</h2>
            <p>
              Saved in {saveResult.mode === "backend" ? "backend-connected mode" : "local fallback mode"} with {saveResult.actionCount} action{saveResult.actionCount === 1 ? "" : "s"} and a timeline entry.
            </p>
          </div>
        </section>

        <section className="card dense-card stack-md">
          <div className="compact-row spread">
            <span className="badge badge-type">{saveResult.qibit.type}</span>
            <span className="badge badge-open">{saveResult.qibit.priority}</span>
          </div>
          <div className="compact-text">{saveResult.qibit.summary}</div>
          <div className="action-row">
            <Link to="/" className="btn btn-primary">
              Go to Today
            </Link>
            <Link to="/timeline" className="btn btn-outline">
              Open Timeline
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="page-stack">
        <section className="desk-banner">
          <div>
            <div className="section-tag subdued">Review</div>
            <h2>Approval desk</h2>
            <p>No pending draft. Capture something first.</p>
          </div>
        </section>
        <div className="card dense-card">
          <StateEmpty icon={<CheckSquare size={28} />} text="No pending draft to review." />
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Review</div>
          <h2>Approve the draft.</h2>
          <p>Save commits the final QiBit, accepted actions, and one timeline entry.</p>
        </div>
      </section>

      <form className="two-col review-grid" onSubmit={handleSave}>
        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Raw Capture</span>
            <span className="card-count">{draft.source}</span>
          </div>
          <div className="raw-panel">{draft.rawText}</div>

          <div className="card-header">
            <span className="card-title">Agent Draft</span>
            <span className="card-count">{draft.agentDraft.confidence}</span>
          </div>

          <div className="stack-sm">
            <div className="compact-row spread">
              <span className="badge badge-type">{draft.agentDraft.suggestedType}</span>
              <span className="badge badge-open">{draft.agentDraft.suggestedPriority}</span>
            </div>
            <div className="stack-xs compact-text">
              <strong>{draft.agentDraft.suggestedTitle}</strong>
              <span>{draft.agentDraft.suggestedSummary}</span>
              <span>{draft.agentDraft.insight}</span>
            </div>
            <div className="item-meta">
              {draft.agentDraft.suggestedTags.map((tag) => (
                <span key={tag} className="badge badge-bucket">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="item-meta">
              {draft.agentDraft.detectedSignals.map((signal) => (
                <span key={signal} className="badge badge-triaged">
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Final QiBit</span>
            <span className="card-count">{actions.filter((action) => action.kept).length} actions kept</span>
          </div>

          <div>
            <label className="form-label">Title</label>
            <input className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="three-col">
            <div>
              <label className="form-label">Type</label>
              <select className="select-input" value={type} onChange={(event) => setType(event.target.value as QiBitType)}>
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select className="select-input" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Space</label>
              <input className="text-input" value={space} onChange={(event) => setSpace(event.target.value)} />
            </div>
          </div>

          <div className="three-col">
            <div>
              <label className="form-label">Thread</label>
              <select className="select-input" value={threadId} onChange={(event) => setThreadId(event.target.value)}>
                <option value="">No thread</option>
                {threads.map((thread) => (
                  <option key={thread.id} value={thread.id}>
                    {thread.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Future Slot</label>
              <select className="select-input" value={futureSlot} onChange={(event) => setFutureSlot(event.target.value)}>
                {["today", "tomorrow", "this_week", "next_week", "later"].map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="capture-checklist">
              <span className="form-label">Save context</span>
              <div className="stack-xs compact-text">
                <span>Thread and slot persist with the record.</span>
                <span>Accepted actions inherit the thread.</span>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Summary</label>
            <textarea className="textarea-input" rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
          </div>

          <div>
            <label className="form-label">Tags</label>
            <input className="text-input" value={tags} onChange={(event) => setTags(event.target.value)} />
          </div>

          <div className="stack-sm">
            <div className="card-header">
              <span className="card-title">Linked People</span>
              <span className="card-count">{selectedPeopleIds.length}</span>
            </div>
            {people.length > 0 ? (
              <div className="filter-chip-row">
                {people.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    className={`filter-chip ${selectedPeopleIds.includes(person.id) ? "is-active" : ""}`}
                    onClick={() => togglePerson(person.id)}
                  >
                    {person.display_name}
                  </button>
                ))}
              </div>
            ) : (
              <span className="compact-text">No people records yet. Add people first if this record should link back to them.</span>
            )}
          </div>

          <div className="stack-sm">
            <div className="card-header">
              <span className="card-title">Generated Actions</span>
              <span className="card-count">{actions.length}</span>
            </div>

            {actions.length === 0 ? (
              <StateEmpty icon={<CheckSquare size={20} />} text="No actions extracted from this capture." />
            ) : (
              actions.map((action) => (
                <div key={action.id} className={`generated-action ${action.kept ? "" : "is-discarded"}`}>
                  <div className="compact-row spread">
                    <span className="badge badge-type">{action.priority}</span>
                    <button
                      type="button"
                      className={`btn btn-sm ${action.kept ? "btn-ghost" : "btn-outline"}`}
                      onClick={() => toggleAction(action.id)}
                    >
                      {action.kept ? "Discard" : "Keep"}
                    </button>
                  </div>
                  <input
                    className="text-input"
                    value={action.title}
                    onChange={(event) => updateActionField(action.id, { title: event.target.value })}
                    disabled={!action.kept}
                  />
                  <div className="compact-row">
                    <input
                      className="text-input"
                      value={action.dueHint ?? ""}
                      onChange={(event) => updateActionField(action.id, { dueHint: event.target.value || undefined })}
                      disabled={!action.kept}
                      placeholder="Due hint"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="action-row">
            <button type="button" className="btn btn-ghost" onClick={handleDiscard}>
              Discard Draft
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveState === "saving"}>
              {saveState === "saving" ? "Saving..." : "Save QiBit"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
