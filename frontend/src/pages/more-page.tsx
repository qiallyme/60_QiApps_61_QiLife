import { Link } from "react-router-dom";
import { Calendar, FileText, Layers, MessageCircle, DollarSign } from "lucide-react";

const MODULES = [
  { href: "/inbox", label: "Inbox", note: "API-backed triage queue when backend is connected.", icon: <Layers size={16} /> },
  { href: "/threads", label: "Threads", note: "Grouped situations, projects, and storylines.", icon: <Layers size={16} /> },
  { href: "/calendar", label: "Calendar", note: "Scheduled events and time-linked work.", icon: <Calendar size={16} /> },
  { href: "/documents", label: "Documents", note: "Evidence, files, and linked records.", icon: <FileText size={16} /> },
  { href: "/money", label: "Money", note: "Transactions and obligations.", icon: <DollarSign size={16} /> },
  { href: "/ask", label: "Ask QiLife", note: "Future retrieval and cited answers.", icon: <MessageCircle size={16} /> },
];

export function MorePage() {
  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">More</div>
          <h2>Secondary modules.</h2>
          <p>Keep the main rail focused on the daily loop. Everything else lives here until it earns top-level space.</p>
        </div>
      </section>

      <section className="card dense-card">
        <div className="card-header">
          <span className="card-title">Available Modules</span>
          <span className="card-count">{MODULES.length}</span>
        </div>

        <div className="stack-sm">
          {MODULES.map((module) => (
            <Link key={module.href} to={module.href} className="list-link">
              <div className="compact-row">
                {module.icon}
                <div>
                  <div className="item-title">{module.label}</div>
                  <div className="item-sub">{module.note}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
