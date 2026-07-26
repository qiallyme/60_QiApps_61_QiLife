import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { relationResolver } from "../../features/qilife/relations/relationResolver";
import type { QiRecord } from "../../features/qilife/types";
import { ProjectForm } from "./components/ProjectForm";
import { projectRepository } from "./services/projectRepository";
import type { Project } from "./types";

export function ProjectsIndexRoute() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { void projectRepository.list().then(setProjects); }, []);
  return <main className="qilife-page"><header className="qilife-page-header"><div><div className="qilife-eyebrow">ORGANIZE</div><h1>Projects</h1></div><Link className="qilife-btn primary" to="/projects/new">New Project</Link></header><div className="qilife-card-grid">{projects.map((project) => <Link className="qilife-card" to={`/projects/${project.id}`} key={project.id}><h3>{project.name}</h3><p>{project.status} · {project.priority}</p><p>{project.brief}</p></Link>)}</div>{projects.length === 0 && <div className="qilife-empty">No Projects yet.</div>}</main>;
}

export function ProjectNewRoute() {
  const navigate = useNavigate();
  return <main className="qilife-page"><h1>New Project</h1><ProjectForm onCancel={() => navigate("/projects")} onSave={async (draft) => { const project = await projectRepository.create(draft); navigate(`/projects/${project.id}`, { replace: true }); }} /></main>;
}

function RelatedList({ title, records, route }: { title: string; records: QiRecord[]; route?: string }) {
  return <section className="qilife-panel"><h2>{title}</h2>{records.length ? <ul className="qilife-related-list">{records.map((record) => <li key={record.id}>{route ? <Link to={`${route}/${record.id}`}>{record.title}</Link> : record.title}</li>)}</ul> : <p className="qilife-muted">None yet.</p>}</section>;
}

export function ProjectDetailRoute() {
  const { id = "" } = useParams();
  const [project, setProject] = useState<Project | null | undefined>();
  const [actions, setActions] = useState<QiRecord[]>([]);
  const [people, setPeople] = useState<QiRecord[]>([]);
  const [journal, setJournal] = useState<QiRecord[]>([]);
  const [related, setRelated] = useState<QiRecord[]>([]);
  useEffect(() => { Promise.all([projectRepository.get(id), relationResolver.getActionsForProject(id), relationResolver.getPeopleForProject(id), relationResolver.getJournalForProject(id), relationResolver.getRelatedRecords(id)]).then(([p, a, pe, j, r]) => { setProject(p); setActions(a); setPeople(pe); setJournal(j); setRelated(r); }); }, [id]);
  if (project === undefined) return <main className="qilife-page"><div className="qilife-empty">Loading Project…</div></main>;
  if (!project) return <main className="qilife-page"><div className="qilife-error">Project not found or inaccessible.</div><Link to="/projects">Back to Projects</Link></main>;
  const open = actions.filter((a) => !["done", "cancelled"].includes(a.status ?? "")).length;
  const blocked = actions.filter((a) => a.status === "blocked").length;
  const completed = actions.filter((a) => a.status === "done").length;
  const nextDue = [...actions].filter((a) => a.due_date && a.status !== "done").sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))[0];
  const other = (entity: string) => related.filter((record) => record.entity_key === entity);
  return <main className="qilife-page"><header className="qilife-page-header"><div><div className="qilife-eyebrow">PROJECT</div><h1>{project.name}</h1><p>{project.brief}</p></div><div className="qilife-actions"><Link className="qilife-btn" to={`/projects/${id}/edit`}>Edit</Link><Link className="qilife-btn primary" to={`/actions/new?projectId=${id}`}>Add Action</Link></div></header><div className="qilife-metric-grid"><div className="qilife-metric"><strong>{open}</strong><span>Open Actions</span></div><div className="qilife-metric"><strong>{blocked}</strong><span>Blocked</span></div><div className="qilife-metric"><strong>{completed}</strong><span>Completed</span></div><div className="qilife-metric"><strong>{nextDue?.due_date ?? "—"}</strong><span>Next due</span></div></div><div className="qilife-actions"><Link to={`/journal/new?projectId=${id}`}>Add Journal entry</Link><Link to={`/timeline?projectId=${id}`}>Add Event</Link><Link to={`/people?projectId=${id}`}>Link Person</Link><Link to={`/documents?projectId=${id}`}>Link Document</Link></div><div className="qilife-dashboard-grid"><RelatedList title="Actions" records={actions} route="/actions" /><RelatedList title="People" records={people} route="/people" /><RelatedList title="Journal entries" records={journal} route="/journal" /><RelatedList title="Threads" records={other("thread")} route="/threads" /><RelatedList title="Timeline events" records={other("event")} /><RelatedList title="Decisions" records={other("decision")} /><RelatedList title="Documents" records={other("document")} /><RelatedList title="Knowledge" records={other("knowledge_item")} /></div></main>;
}

export function ProjectEditRoute() {
  const { id = "" } = useParams(); const navigate = useNavigate(); const [project, setProject] = useState<Project | null | undefined>();
  useEffect(() => { void projectRepository.get(id).then(setProject); }, [id]);
  if (project === undefined) return <main className="qilife-page">Loading Project…</main>;
  if (!project) return <main className="qilife-page">Project not found.</main>;
  const { id: _id, createdAt: _created, updatedAt: _updated, ...draft } = project;
  return <main className="qilife-page"><h1>Edit Project</h1><ProjectForm initial={draft} onCancel={() => navigate(`/projects/${id}`)} onSave={async (next) => { await projectRepository.update(id, next); navigate(`/projects/${id}`, { replace: true }); }} /></main>;
}
