import type { ReactNode } from "react";
import { BookOpen, Cloud, ExternalLink, FolderKanban, HardDrive, Lock, MonitorSmartphone, Shield, TerminalSquare, Workflow } from "lucide-react";
import { Link } from "react-router-dom";

type SurfaceTone = "public" | "private" | "degraded" | "docs";

type Surface = {
  id: string;
  title: string;
  description: string;
  href?: string;
  to?: string;
  tone: SurfaceTone;
  badge: string;
  note?: string;
};

type SurfaceSection = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  surfaces: Surface[];
};

const cockpitSections: SurfaceSection[] = [
  {
    id: "front-door",
    title: "Front Door",
    description: "Public and private entrypoints that now need to converge under QiLife.",
    icon: <MonitorSmartphone size={16} />,
    surfaces: [
      {
        id: "qilife-knowledge",
        title: "QiLife Knowledge",
        to: "/knowledge",
        description: "Docs-backed knowledge inside QiLife. This is the in-app handoff for the new QiOS Start docs build.",
        tone: "docs",
        badge: "In app",
      },
      {
        id: "qiaccess-public",
        title: "QiAccess Public Entry",
        href: "https://access.qially.com",
        description: "Current public front door that still represents the old launcher model.",
        tone: "public",
        badge: "Public",
      },
      {
        id: "qiaccess-tailnet",
        title: "QiAccess Tailnet Route",
        href: "https://qiserver-1.cerberus-sirius.ts.net",
        description: "Private route for the existing launcher while the QiLife cockpit absorbs it.",
        tone: "private",
        badge: "Tailnet",
      },
      {
        id: "cloudflare",
        title: "Cloudflare",
        href: "https://dash.cloudflare.com",
        description: "Zero Trust, DNS, tunnel, and edge control for the front door.",
        tone: "public",
        badge: "Ops",
      },
    ],
  },
  {
    id: "knowledge-and-archive",
    title: "Knowledge And Archive",
    description: "The places QiLife needs to reference directly instead of leaving them behind a separate launcher repo.",
    icon: <BookOpen size={16} />,
    surfaces: [
      {
        id: "wiki-js",
        title: "Wiki.js",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9448",
        description: "Operational wiki and the current private knowledge surface.",
        tone: "private",
        badge: "Private",
        note: "Public route was previously marked degraded.",
      },
      {
        id: "paperless",
        title: "Paperless-ngx",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9447",
        description: "Document intake, OCR, and archive workflow.",
        tone: "private",
        badge: "Private",
      },
      {
        id: "google-drive",
        title: "Google Drive",
        href: "https://drive.google.com",
        description: "Files, notes, and client material that still sit outside the app runtime.",
        tone: "public",
        badge: "External",
      },
      {
        id: "qdrant",
        title: "Qdrant",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9452/dashboard",
        description: "Vector storage and retrieval backend reference.",
        tone: "private",
        badge: "Private",
      },
    ],
  },
  {
    id: "server-and-ops",
    title: "Server And Ops",
    description: "The cockpit layer QiAccess handled before. These are the launch points worth carrying into QiLife.",
    icon: <TerminalSquare size={16} />,
    surfaces: [
      {
        id: "portainer",
        title: "Portainer",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9449",
        description: "Container and stack operations.",
        tone: "private",
        badge: "Admin",
      },
      {
        id: "cockpit",
        title: "Cockpit",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9090",
        description: "Machine-level administration for QiServer.",
        tone: "private",
        badge: "Admin",
      },
      {
        id: "n8n",
        title: "n8n",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9450",
        description: "Workflow automation and queue orchestration.",
        tone: "private",
        badge: "Automation",
      },
      {
        id: "nocodb",
        title: "NocoDB",
        href: "https://qiserver-1.cerberus-sirius.ts.net:8443",
        description: "Structured operational data admin UI.",
        tone: "private",
        badge: "Data",
      },
      {
        id: "open-webui",
        title: "Open WebUI",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9446",
        description: "Local AI chat and tool surface.",
        tone: "private",
        badge: "AI",
      },
      {
        id: "uptime-kuma",
        title: "Uptime Kuma",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9451",
        description: "Service checks and status monitoring.",
        tone: "private",
        badge: "Health",
      },
      {
        id: "dailywave-health",
        title: "DailyWave Health",
        href: "https://qiserver-1.cerberus-sirius.ts.net:9455/health",
        description: "Known backend health endpoint retained as quick truth.",
        tone: "docs",
        badge: "Health",
      },
      {
        id: "neo4j",
        title: "Neo4j Browser",
        href: "http://qiserver-1.cerberus-sirius.ts.net:7474",
        description: "Graph exploration surface that was previously noted as unhealthy.",
        tone: "degraded",
        badge: "Attention",
        note: "Keep visible, but do not treat as healthy.",
      },
    ],
  },
];

function toneClassName(tone: SurfaceTone) {
  if (tone === "public") return "badge badge-open";
  if (tone === "private") return "badge badge-active";
  if (tone === "degraded") return "badge badge-critical";
  return "badge badge-bucket";
}

export function CockpitPage() {
  const totals = cockpitSections.reduce(
    (summary, section) => {
      section.surfaces.forEach((surface) => {
        summary.total += 1;
        summary[surface.tone] += 1;
      });
      return summary;
    },
    { total: 0, public: 0, private: 0, degraded: 0, docs: 0 },
  );

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Cockpit</div>
          <h2>QiLife is becoming the front door.</h2>
          <p>
            This is the first carry-over of QiAccess into QiLife: the launcher, knowledge, and server surfaces that still matter, without keeping a separate
            portal repo in the daily loop.
          </p>
        </div>
        <div className="cockpit-hero-actions">
          <Link className="btn btn-primary" to="/knowledge">
            <BookOpen size={16} />
            Knowledge
          </Link>
          <Link className="btn btn-outline" to="/capture">
            <FolderKanban size={16} />
            Capture
          </Link>
        </div>
      </section>

      <div className="stats-grid cockpit-stats-grid">
        <div className="card dense-card">
          <div className="compact-row">
            <Cloud size={16} />
            <span className="card-title">Public</span>
          </div>
          <div className="cockpit-stat-value">{totals.public}</div>
          <div className="compact-text">Routes safe to open from the web front door.</div>
        </div>
        <div className="card dense-card">
          <div className="compact-row">
            <Lock size={16} />
            <span className="card-title">Private</span>
          </div>
          <div className="cockpit-stat-value">{totals.private}</div>
          <div className="compact-text">Tailnet or admin-only surfaces that still belong in the cockpit.</div>
        </div>
        <div className="card dense-card">
          <div className="compact-row">
            <Shield size={16} />
            <span className="card-title">Docs / Handoff</span>
          </div>
          <div className="cockpit-stat-value">{totals.docs}</div>
          <div className="compact-text">Bridges into knowledge or status context rather than a full app surface.</div>
        </div>
        <div className="card dense-card">
          <div className="compact-row">
            <HardDrive size={16} />
            <span className="card-title">Attention</span>
          </div>
          <div className="cockpit-stat-value">{totals.degraded}</div>
          <div className="compact-text">Known degraded surfaces kept visible so the cockpit stays honest.</div>
        </div>
      </div>

      {cockpitSections.map((section) => (
        <section key={section.id} className="card dense-card stack-md">
          <div className="card-header wrap-gap">
            <div className="compact-row">
              {section.icon}
              <span className="card-title">{section.title}</span>
            </div>
            <span className="card-count">{section.surfaces.length}</span>
          </div>
          <p className="compact-text">{section.description}</p>

          <div className="cockpit-grid">
            {section.surfaces.map((surface) => (
              <article key={surface.id} className="record-link-card cockpit-card">
                <div className="compact-row spread top">
                  <strong>{surface.title}</strong>
                  <span className={toneClassName(surface.tone)}>{surface.badge}</span>
                </div>
                <div className="compact-text">{surface.description}</div>
                {surface.note ? <div className="compact-text">{surface.note}</div> : null}
                <div className="action-row cockpit-card-actions">
                  {surface.to ? (
                    <Link className="btn btn-outline btn-sm" to={surface.to}>
                      Open
                    </Link>
                  ) : null}
                  {surface.href ? (
                    <a className="btn btn-outline btn-sm" href={surface.href} rel="noreferrer" target="_blank">
                      Open
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="card dense-card stack-sm">
        <div className="card-header wrap-gap">
          <span className="card-title">Consolidation Direction</span>
          <span className="card-count">{totals.total}</span>
        </div>
        <div className="compact-text">
          QiAccess launcher behavior now belongs here. The next repo-level step is to move these surface definitions and docs ownership into the promoted
          QiLife workspace so `10_QiAccess` can stop being the canonical Git remote.
        </div>
        <div className="compact-row wrap-gap">
          <Link className="inline-link" to="/knowledge">
            <BookOpen size={14} />
            Review docs handoff
          </Link>
          <Link className="inline-link" to="/timeline">
            <Workflow size={14} />
            Keep the daily loop in QiLife
          </Link>
        </div>
      </section>
    </div>
  );
}
