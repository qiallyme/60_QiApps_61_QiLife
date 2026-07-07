import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, History, UserRound } from "lucide-react";
import { BackendUnavailableError, getPersonFromBackend } from "../api/client";
import type { Action, Person, QiBit } from "../types";
import { formatDate, formatRelative } from "../utils/format";
import { getActions, getPersonById, getQiBitsForPerson, savePerson } from "../utils/storage";
import { StateEmpty } from "./shared";

type Props = {
  refreshToken: number;
};

export function PersonDetailPage({ refreshToken }: Props) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [mentionedQiBits, setMentionedQiBits] = useState<QiBit[]>([]);
  const [mentionedActions, setMentionedActions] = useState<Action[]>([]);

  useEffect(() => {
    const nextPerson = id ? getPersonById(id) : null;
    setPerson(nextPerson);

    if (!nextPerson) {
      setMentionedQiBits([]);
      setMentionedActions([]);
      return;
    }

    const name = nextPerson.display_name.toLowerCase();
    const qibits = getQiBitsForPerson(nextPerson.id);
    const actions = getActions().filter((action) => {
      const haystack = `${action.title} ${action.sourceText ?? ""}`.toLowerCase();
      return qibits.some((qibit) => qibit.id === action.qibitId) || haystack.includes(name);
    });

    setMentionedQiBits(qibits.slice(0, 8));
    setMentionedActions(actions.slice(0, 8));
  }, [id, refreshToken]);

  useEffect(() => {
    if (!id || person) return;

    let active = true;
    setLoading(true);

    getPersonFromBackend(id)
      .then((payload) => {
        if (!active) return;
        savePerson(payload);
        setPerson(getPersonById(id));
      })
      .catch((error) => {
        if (!(error instanceof BackendUnavailableError)) {
          console.warn("Person detail fetch unavailable.", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, person]);

  const timelineLink = useMemo(() => {
    if (!person) return "/timeline";
    return `/timeline?person=${encodeURIComponent(person.id)}`;
  }, [person]);

  if (!person) {
    return (
      <div className="page-stack">
        <section className="desk-banner">
          <div>
            <div className="section-tag subdued">Person</div>
            <h2>{loading ? "Loading person" : "Person not found"}</h2>
            <p>{loading ? "Checking backend and local storage for this person." : "The requested person is not available in the current local data set."}</p>
          </div>
        </section>
        <section className="card dense-card">
          <StateEmpty icon={<UserRound size={24} />} text={loading ? "Looking up person details." : "Open People to continue from an existing record."} />
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="desk-banner detail-banner">
        <div className="stack-sm">
          <div className="compact-row wrap-gap">
            <span className="section-tag subdued">Person</span>
            <span className="badge badge-type">{person.type}</span>
            {person.relationship ? <span className="badge badge-bucket">{person.relationship}</span> : null}
          </div>
          <h2>{person.display_name}</h2>
          <p>{person.notes || "No notes saved for this person yet."}</p>
          <div className="item-meta">
            {person.legal_name !== person.display_name ? <span className="item-sub">Legal name: {person.legal_name}</span> : null}
            {person.created_at ? <span className="item-sub">Created {formatDate(person.created_at)}</span> : null}
            {person.updated_at ? <span className="item-sub">Updated {formatRelative(person.updated_at)}</span> : null}
          </div>
        </div>

        <div className="action-row detail-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
          <Link to="/people" className="btn btn-outline">
            <UserRound size={16} />
            All People
          </Link>
          <Link to={timelineLink} className="btn btn-outline">
            <History size={16} />
            Timeline
          </Link>
          <Link to="/knowledge" className="btn btn-outline">
            <BookOpen size={16} />
            Knowledge
          </Link>
        </div>
      </section>

      <div className="two-col detail-grid">
        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Person Record</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Relationship</span>
            <span>{person.relationship || "No relationship saved."}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Email</span>
            <span>{person.email || "No email saved."}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Phone</span>
            <span>{person.phone || "No phone saved."}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Address</span>
            <span>{person.address || "No address saved."}</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Notes</span>
            <div className="raw-panel">{person.notes || "No notes saved."}</div>
          </div>
        </section>

        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Related Records</span>
          </div>

          <div className="detail-block">
            <span className="form-label">Mentioned in QiBits</span>
            {mentionedQiBits.length > 0 ? (
              <div className="stack-sm">
                {mentionedQiBits.map((qibit) => (
                  <Link key={qibit.id} to={`/qibits/${qibit.id}`} className="record-link-card">
                    <div className="compact-row spread">
                      <strong>{qibit.title}</strong>
                      <span className="badge badge-type">{qibit.type}</span>
                    </div>
                    <div className="compact-text">{qibit.summary}</div>
                    <div className="item-meta">
                      <span className="badge badge-bucket">{qibit.space}</span>
                      <span className="item-sub">{formatRelative(qibit.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <span className="compact-text">No saved QiBits mention this person yet.</span>
            )}
          </div>

          <div className="detail-block">
            <span className="form-label">Mentioned in Actions</span>
            {mentionedActions.length > 0 ? (
              <div className="stack-sm">
                {mentionedActions.map((action) => (
                  <Link key={action.id} to={`/actions/${action.id}`} className="record-link-card">
                    <div className="compact-row spread">
                      <strong>{action.title}</strong>
                      <span className={`badge ${action.status === "done" ? "badge-bucket" : "badge-open"}`}>{action.status}</span>
                    </div>
                    <div className="item-meta">
                      <span className={`badge badge-${action.priority}`}>{action.priority}</span>
                      <span className="item-sub">{formatRelative(action.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <span className="compact-text">No saved actions mention this person yet.</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
