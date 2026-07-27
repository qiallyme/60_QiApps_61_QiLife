import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RecordList } from "../../features/qilife/components/RecordList";
import { MultiRelationSelector, RelationSelector } from "../../features/qilife/components/RelationSelector";
import { readRelationIds } from "../../features/qilife/relations/relationshipFields";
import { relationResolver } from "../../features/qilife/relations/relationResolver";
import { listRecords } from "../../features/qilife/services/qilifeStore";
import { recordRoute } from "../../features/qilife/utils/recordDisplay";
import type { QiRecord } from "../../features/qilife/types";
import { ProjectForm } from "./components/ProjectForm";
import { projectQuickCreate } from "./services/projectQuickCreate";
import { projectRepository } from "./services/projectRepository";
import type { Project } from "./types";

function titleFor(records: QiRecord[], id: string | null) {
  return id ? records.find((record) => record.id === id)?.title ?? id : "";
}

function RelatedList({ title, records, route, lookup }: { title: string; records: QiRecord[]; route?: string; lookup: QiRecord[] }) {
  return (
    <section className="qilife-panel">
      <h2>{title}</h2>
      {records.length ? (
        <RecordList
          ariaLabel={title}
          items={records.map((record) => ({
            id: record.id,
            entityKey: record.entity_key,
            title: record.title,
            metadata: record.entity_key === "task" && route === "/actions"
              ? [
                  readRelationIds(record.data, "project", "project")[0] ? `Project: ${titleFor(lookup, readRelationIds(record.data, "project", "project")[0])}` : "",
                  readRelationIds(record.data, "person", "person")[0] ? `People: ${readRelationIds(record.data, "person", "person").map((id) => titleFor(lookup, id)).join(", ")}` : "",
                ].filter(Boolean).join(" · ")
              : undefined,
            status: record.status ?? null,
            priority: record.priority ?? null,
            dateLabel: record.due_date ? record.due_date.slice(0, 10) : null,
            to: route ? `${route}/${record.id}` : recordRoute(record) ?? undefined,
          }))}
        />
      ) : (
        <p className="qilife-muted">None yet.</p>
      )}
    </section>
  );
}

export function ProjectsIndexRoute() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    void projectRepository.list().then(setProjects);
  }, []);

  return (
    <main className="qilife-page">
      <header className="qilife-page-header">
        <div>
          <div className="qilife-eyebrow">ORGANIZE</div>
          <h1>Projects</h1>
        </div>
        <Link className="qilife-btn primary" to="/projects/new">New Project</Link>
      </header>
      <RecordList
        ariaLabel="Projects"
        emptyMessage="No Projects yet."
        items={projects.map((project) => ({
          id: project.id,
          entityKey: "project",
          title: project.name,
          metadata: project.brief,
          status: project.status,
          priority: project.priority,
          dateLabel: project.dueDate ? `Due ${project.dueDate}` : null,
          to: `/projects/${project.id}`,
        }))}
      />
    </main>
  );
}

export function ProjectNewRoute() {
  const navigate = useNavigate();
  return (
    <main className="qilife-page">
      <h1>New Project</h1>
      <ProjectForm
        onCancel={() => navigate("/projects")}
        onSave={async (draft) => {
          const project = await projectRepository.create(draft);
          navigate(`/projects/${project.id}`, { replace: true });
        }}
      />
    </main>
  );
}

export function ProjectDetailRoute() {
  const { id = "" } = useParams();
  const [project, setProject] = useState<Project | null | undefined>();
  const [actions, setActions] = useState<QiRecord[]>([]);
  const [people, setPeople] = useState<QiRecord[]>([]);
  const [journal, setJournal] = useState<QiRecord[]>([]);
  const [related, setRelated] = useState<QiRecord[]>([]);
  const [lookup, setLookup] = useState<QiRecord[]>([]);

  useEffect(() => {
    Promise.all([
      projectRepository.get(id),
      relationResolver.getActionsForProject(id),
      relationResolver.getPeopleForProject(id),
      relationResolver.getJournalForProject(id),
      relationResolver.getRelatedRecords(id),
      listRecords("project"),
      listRecords("person"),
      listRecords("thread"),
      listRecords("journal_entry"),
      listRecords("event"),
      listRecords("decision"),
      listRecords("document"),
      listRecords("knowledge_item"),
    ]).then(([p, a, pe, j, r, ...rest]) => {
      setProject(p);
      setActions(a);
      setPeople(pe);
      setJournal(j);
      setRelated(r);
      setLookup(rest.flat());
    });
  }, [id]);

  if (project === undefined) return <main className="qilife-page"><div className="qilife-empty">Loading Project...</div></main>;
  if (!project) return <main className="qilife-page"><div className="qilife-error">Project not found or inaccessible.</div><Link to="/projects">Back to Projects</Link></main>;

  const open = actions.filter((item) => !["done", "cancelled"].includes(item.status ?? "")).length;
  const blocked = actions.filter((item) => item.status === "blocked").length;
  const completed = actions.filter((item) => item.status === "done").length;
  const nextDue = [...actions].filter((item) => item.due_date && item.status !== "done").sort((left, right) => String(left.due_date).localeCompare(String(right.due_date)))[0];
  const other = (entity: string) => related.filter((record) => record.entity_key === entity);

  return (
    <main className="qilife-page">
      <header className="qilife-page-header">
        <div>
          <div className="qilife-eyebrow">PROJECT</div>
          <h1>{project.name}</h1>
          <p>{project.brief}</p>
        </div>
        <div className="qilife-actions">
          <Link className="qilife-btn" to={`/projects/${id}/edit`}>Edit</Link>
          <Link className="qilife-btn primary" to={`/actions/new?projectId=${id}`}>Add Action</Link>
        </div>
      </header>
      <div className="qilife-metric-grid">
        <div className="qilife-metric"><strong>{open}</strong><span>Open Actions</span></div>
        <div className="qilife-metric"><strong>{blocked}</strong><span>Blocked</span></div>
        <div className="qilife-metric"><strong>{completed}</strong><span>Completed</span></div>
        <div className="qilife-metric"><strong>{nextDue?.due_date ?? "—"}</strong><span>Next due</span></div>
      </div>
      <div className="qilife-actions">
        <Link className="qilife-btn" to={`/journal/new?projectId=${id}`}>Add Journal entry</Link>
        <Link className="qilife-btn" to={`/events/new?projectId=${id}`}>Add Event</Link>
        <Link className="qilife-btn" to={`/projects/${id}/link-person`}>Link Person</Link>
        <Link className="qilife-btn" to={`/projects/${id}/link-document`}>Link Document</Link>
      </div>
      <div className="qilife-dashboard-grid">
        <RelatedList title="Actions" records={actions} route="/actions" lookup={lookup} />
        <RelatedList title="People" records={people} route="/people" lookup={lookup} />
        <RelatedList title="Journal entries" records={journal} route="/journal" lookup={lookup} />
        <RelatedList title="Threads" records={other("thread")} route="/threads" lookup={lookup} />
        <RelatedList title="Timeline events" records={other("event")} lookup={lookup} />
        <RelatedList title="Decisions" records={other("decision")} lookup={lookup} />
        <RelatedList title="Documents" records={other("document")} lookup={lookup} />
        <RelatedList title="Knowledge" records={other("knowledge_item")} lookup={lookup} />
      </div>
    </main>
  );
}

export function ProjectEditRoute() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null | undefined>();

  useEffect(() => {
    void projectRepository.get(id).then(setProject);
  }, [id]);

  if (project === undefined) return <main className="qilife-page">Loading Project...</main>;
  if (!project) return <main className="qilife-page">Project not found.</main>;

  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...draft } = project;
  return (
    <main className="qilife-page">
      <h1>Edit Project</h1>
      <ProjectForm
        initial={draft}
        onCancel={() => navigate(`/projects/${id}`)}
        onSave={async (next) => {
          await projectRepository.update(id, next);
          navigate(`/projects/${id}`, { replace: true });
        }}
      />
    </main>
  );
}

export function ProjectPersonLinkRoute() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [peopleIds, setPeopleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRecords("project")
      .then((projects) => {
        const project = projects.find((item) => item.id === id);
        if (project) setPeopleIds(readRelationIds(project.data, "person", "person"));
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="qilife-page">
      <h1>Link People to Project</h1>
      <section className="qilife-panel">
        <label className="qilife-label" htmlFor="project-people">People</label>
        {!loading && <MultiRelationSelector id="project-people" name="people_ids" relationEntity="person" values={peopleIds} onChange={setPeopleIds} />}
        <div className="qilife-actions">
          <button className="qilife-btn" onClick={() => navigate(`/projects/${id}`)}>Cancel</button>
          <button className="qilife-btn primary" onClick={() => void projectQuickCreate.linkPeople(id, peopleIds).then(() => navigate(`/projects/${id}`))}>Save links</button>
        </div>
      </section>
    </main>
  );
}

export function ProjectDocumentLinkRoute() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [documentId, setDocumentId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  async function save() {
    if (documentId) await projectQuickCreate.linkDocument(documentId, id);
    else if (title.trim()) await projectQuickCreate.createDocument(id, { title: title.trim(), notes });
    else return;
    navigate(`/projects/${id}`);
  }

  return (
    <main className="qilife-page">
      <h1>Link Document to Project</h1>
      <section className="qilife-panel">
        <label className="qilife-label" htmlFor="project-document">Existing document</label>
        <RelationSelector id="project-document" name="document_id" relationEntity="document" value={documentId} onChange={setDocumentId} />
        <div className="qilife-divider">or create a document</div>
        <label className="qilife-label" htmlFor="document-title">Title<input id="document-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="qilife-label" htmlFor="document-notes">Notes<textarea id="document-notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        <div className="qilife-actions">
          <button className="qilife-btn" onClick={() => navigate(`/projects/${id}`)}>Cancel</button>
          <button className="qilife-btn primary" onClick={() => void save()}>Link document</button>
        </div>
      </section>
    </main>
  );
}

export function ProjectEventNewRoute() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const projectId = params.get("projectId") ?? "";
  const [title, setTitle] = useState("");
  const [happenedAt, setHappenedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  if (!projectId) return <main className="qilife-page"><div className="qilife-error">A Project is required to create this Event.</div></main>;

  return (
    <main className="qilife-page">
      <h1>Add Event</h1>
      <form
        className="qilife-panel"
        onSubmit={(event) => {
          event.preventDefault();
          void projectQuickCreate.createEvent(projectId, { title, happenedAt, notes }).then(() => navigate(`/projects/${projectId}`));
        }}
      >
        <label className="qilife-label" htmlFor="event-title">Title<input id="event-title" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="qilife-label" htmlFor="event-date">Date<input id="event-date" name="happened_at" type="date" value={happenedAt} onChange={(e) => setHappenedAt(e.target.value)} /></label>
        <label className="qilife-label" htmlFor="event-notes">Notes<textarea id="event-notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        <div className="qilife-actions">
          <button type="button" className="qilife-btn" onClick={() => navigate(`/projects/${projectId}`)}>Cancel</button>
          <button className="qilife-btn primary">Create Event</button>
        </div>
      </form>
    </main>
  );
}
