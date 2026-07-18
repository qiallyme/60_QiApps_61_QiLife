import { Link, useLocation } from "react-router-dom";
import { getActionById, getActions, getActionsForQiBit, getPendingDraft, getPeople, getPersonById, getQiBitById, getQiBits, getThreadById, getThreads, getTimelineItems } from "../utils/storage";

type DockLink = {
  label: string;
  href: string;
  meta?: string;
};

type DockSection = {
  title: string;
  links: DockLink[];
};

function buildHomeSections(): DockSection[] {
  const draft = getPendingDraft();
  const actions = getActions().filter((action) => action.status === "open").slice(0, 3);
  const qibits = getQiBits().filter((qibit) => qibit.status !== "new").slice(0, 3);
  const timeline = getTimelineItems().slice(0, 3);

  return [
    {
      title: "Pending",
      links: draft
        ? [{ label: draft.agentDraft.suggestedTitle, href: "/review", meta: "Open review desk" }]
        : [{ label: "No pending review", href: "/capture", meta: "Start new capture" }],
    },
    {
      title: "Open Actions",
      links: actions.length > 0 ? actions.map((action) => ({ label: action.title, href: `/actions/${action.id}`, meta: action.dueHint ?? action.priority })) : [{ label: "No open actions", href: "/actions" }],
    },
    {
      title: "Recent QiBits",
      links: qibits.length > 0 ? qibits.map((qibit) => ({ label: qibit.title, href: `/qibits/${qibit.id}`, meta: qibit.space })) : [{ label: "No saved QiBits", href: "/capture" }],
    },
    {
      title: "Timeline",
      links: timeline.length > 0 ? timeline.map((item) => ({ label: item.title, href: `/qibits/${item.payload.qibitId ?? item.id}`, meta: item.payload.type ?? item.bucket_code })) : [{ label: "Timeline empty", href: "/timeline" }],
    },
  ];
}

function buildQiBitSections(qibitId: string): DockSection[] {
  const qibit = getQiBitById(qibitId);
  if (!qibit) {
    return [{ title: "Record", links: [{ label: "QiBit not in local context", href: "/timeline", meta: "Open timeline" }] }];
  }

  const actions = getActionsForQiBit(qibitId).slice(0, 4);
  const sameSpace = getQiBits().filter((item) => item.id !== qibitId && item.space === qibit.space).slice(0, 3);

  return [
    {
      title: "Source",
      links: [
        { label: qibit.space, href: `/timeline?space=${encodeURIComponent(qibit.space)}`, meta: "Space timeline" },
        { label: qibit.type, href: `/timeline?type=${encodeURIComponent(qibit.type)}`, meta: "Type filter" },
      ],
    },
    {
      title: "People",
      links:
        qibit.linkedPeople && qibit.linkedPeople.length > 0
          ? qibit.linkedPeople.map((person) => ({ label: person.display_name, href: `/people/${person.id}`, meta: person.relationship || person.type }))
          : [{ label: "No linked people", href: `/qibits/${qibit.id}`, meta: "Link people in review" }],
    },
    {
      title: "Linked Actions",
      links: actions.length > 0 ? actions.map((action) => ({ label: action.title, href: `/actions/${action.id}`, meta: action.status })) : [{ label: "No linked actions", href: "/actions" }],
    },
    {
      title: "Nearby Records",
      links: sameSpace.length > 0 ? sameSpace.map((item) => ({ label: item.title, href: `/qibits/${item.id}`, meta: item.type })) : [{ label: "No nearby records", href: `/timeline?space=${encodeURIComponent(qibit.space)}` }],
    },
  ];
}

function buildActionSections(actionId: string): DockSection[] {
  const action = getActionById(actionId);
  if (!action) {
    return [{ title: "Action", links: [{ label: "Action not in local context", href: "/actions" }] }];
  }

  return [
    {
      title: "Action Status",
      links: [{ label: action.status === "done" ? "Marked done" : "Still open", href: `/actions/${action.id}`, meta: action.priority }],
    },
    {
      title: "Linked Record",
      links: action.qibitId ? [{ label: action.qibitTitle ?? "Open source QiBit", href: `/qibits/${action.qibitId}`, meta: "Source QiBit" }] : [{ label: "No source QiBit", href: "/timeline" }],
    },
    {
      title: "Due Context",
      links: [{ label: action.dueHint ?? "No due hint", href: "/actions", meta: "Action queue" }],
    },
  ];
}

function buildThreadSections(threadId: string): DockSection[] {
  const thread = getThreadById(threadId);
  if (!thread) {
    return [{ title: "Thread", links: [{ label: "Thread not in local context", href: "/threads" }] }];
  }

  const qibits = getQiBits().filter((qibit) => qibit.thread_id === thread.id || qibit.bucket_code === thread.bucket_code).slice(0, 4);
  const actions = getActions().filter((action) => action.thread_id === thread.id || action.bucket_code === thread.bucket_code).slice(0, 4);

  return [
    {
      title: "Thread Records",
      links: qibits.length > 0 ? qibits.map((qibit) => ({ label: qibit.title, href: `/qibits/${qibit.id}`, meta: qibit.type })) : [{ label: "No QiBits linked yet", href: `/timeline?space=${encodeURIComponent(thread.bucket_code)}` }],
    },
    {
      title: "Thread Actions",
      links: actions.length > 0 ? actions.map((action) => ({ label: action.title, href: `/actions/${action.id}`, meta: action.status })) : [{ label: "No actions linked yet", href: "/actions" }],
    },
  ];
}

function buildPersonSections(personId: string): DockSection[] {
  const person = getPersonById(personId);
  if (!person) {
    return [{ title: "Person", links: [{ label: "Person not in local context", href: "/people" }] }];
  }

  const qibits = getQiBits()
    .filter((qibit) => `${qibit.title} ${qibit.summary} ${qibit.rawText}`.toLowerCase().includes(person.display_name.toLowerCase()))
    .slice(0, 4);

  return [
    {
      title: "Mentions",
      links: qibits.length > 0 ? qibits.map((qibit) => ({ label: qibit.title, href: `/qibits/${qibit.id}`, meta: qibit.space })) : [{ label: "No saved mentions", href: `/timeline?q=${encodeURIComponent(person.display_name)}` }],
    },
    {
      title: "Contact",
      links: [
        { label: person.email || "No email", href: `/people/${person.id}`, meta: "Email" },
        { label: person.phone || "No phone", href: `/people/${person.id}`, meta: "Phone" },
      ],
    },
  ];
}

export function ContextDock() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const primary = segments[0] ?? "";
  const recordId = segments[1] ?? "";

  let title = "Working Context";
  let sections: DockSection[] = buildHomeSections();

  if (location.pathname === "/capture") {
    title = "Capture Rules";
    sections = [
      {
        title: "Capture",
        links: [
          { label: "Capture raw facts", href: "/capture", meta: "Do not polish first" },
          { label: "Review next", href: "/review", meta: "Approve draft fields" },
          { label: "Open Inbox", href: "/inbox", meta: "See queued captures" },
        ],
      },
    ];
  } else if (location.pathname === "/review") {
    title = "Approval Desk";
    const draft = getPendingDraft();
    sections = [
      {
        title: "Current Draft",
        links: draft
          ? [
              { label: draft.agentDraft.suggestedTitle, href: "/review", meta: draft.agentDraft.suggestedPriority },
              { label: draft.agentDraft.actions.length ? `${draft.agentDraft.actions.length} generated actions` : "No actions generated", href: "/review" },
            ]
          : [{ label: "No pending draft", href: "/capture", meta: "Start a capture" }],
      },
    ];
  } else if (location.pathname === "/timeline") {
    title = "Timeline Filters";
    sections = [
      {
        title: "Jump To",
        links: [
          { label: "All records", href: "/timeline" },
          { label: "Care", href: "/timeline?type=care" },
          { label: "Finance", href: "/timeline?type=finance" },
          { label: "Legal", href: "/timeline?type=legal" },
        ],
      },
    ];
  } else if (primary === "qibits" && recordId) {
    title = "QiBit Context";
    sections = buildQiBitSections(recordId);
  } else if (primary === "actions" && recordId) {
    title = "Action Context";
    sections = buildActionSections(recordId);
  } else if (primary === "threads" && recordId) {
    title = "Thread Context";
    sections = buildThreadSections(recordId);
  } else if (primary === "people" && recordId) {
    title = "Person Context";
    sections = buildPersonSections(recordId);
  } else if (location.pathname === "/actions") {
    title = "Action Layer";
    const actions = getActions().slice(0, 4);
    sections = [
      {
        title: "Queue",
        links: actions.length > 0 ? actions.map((action) => ({ label: action.title, href: `/actions/${action.id}`, meta: action.status })) : [{ label: "No saved actions", href: "/capture" }],
      },
    ];
  } else if (location.pathname === "/knowledge") {
    title = "Knowledge Source";
    sections = [
      {
        title: "Docs",
        links: [
          { label: "Repo docs are source of truth", href: "/knowledge" },
          { label: "Open Knowledge index", href: "/knowledge" },
        ],
      },
    ];
  } else if (location.pathname === "/people") {
    title = "People Layer";
    const people = getPeople().slice(0, 4);
    sections = [
      {
        title: "Recent People",
        links: people.length > 0 ? people.map((person) => ({ label: person.display_name, href: `/people/${person.id}`, meta: person.relationship || person.type })) : [{ label: "No saved people", href: "/people" }],
      },
    ];
  } else if (location.pathname === "/threads") {
    title = "Thread Layer";
    const threads = getThreads().slice(0, 4);
    sections = [
      {
        title: "Recent Threads",
        links: threads.length > 0 ? threads.map((thread) => ({ label: thread.title, href: `/threads/${thread.id}`, meta: thread.status })) : [{ label: "No saved threads", href: "/threads" }],
      },
    ];
  }

  return (
    <div className="dock-panel">
      <div className="dock-header">
        <div className="dock-kicker">Context</div>
        <div className="dock-title">{title}</div>
      </div>
      <div className="dock-body stack-md" style={{ marginTop: 12 }}>
        {sections.map((section) => (
          <div key={section.title} className="stack-xs">
            <div className="form-label" style={{ marginBottom: 0 }}>{section.title}</div>
            <div className="dock-list">
              {section.links.map((link) => (
                <Link key={`${section.title}-${link.label}-${link.href}`} to={link.href} className="record-row-link">
                  <strong>{link.label}</strong>
                  {link.meta ? <span className="compact-text">{link.meta}</span> : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
