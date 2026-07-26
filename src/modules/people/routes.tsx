import { useNavigate, useParams } from "react-router-dom";
import { PeopleList } from "./components/PeopleList";
import { PersonDashboard } from "./components/PersonDashboard";
import { PersonEditor } from "./components/PersonEditor";
import { usePerson } from "./hooks/usePerson";

export function PeopleIndexRoute() {
  return <main className="qilife-page"><PeopleList /></main>;
}

export function PeopleNewRoute() {
  const navigate = useNavigate();
  const { createPerson } = usePerson();

  return (
    <main className="qilife-page">
      <PersonEditor
        onSave={async (input) => {
          const person = await createPerson(input);
          navigate(`/people/${person.id}`, { replace: true });
        }}
        onCancel={() => navigate("/people")}
      />
    </main>
  );
}

export function PeopleDetailRoute() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  return (
    <main className="qilife-page">
      <PersonDashboard
        personId={id}
        onBack={() => navigate("/people")}
        onEdit={() => navigate(`/people/${id}/edit`)}
      />
    </main>
  );
}

export function PeopleEditRoute() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { person, loading, error, updatePerson } = usePerson(id);

  if (loading) return <main className="qilife-page">Loading person…</main>;
  if (error || !person) {
    return <main className="qilife-page">Person record not found.</main>;
  }

  return (
    <main className="qilife-page">
      <PersonEditor
        person={person}
        onSave={async (patch) => {
          await updatePerson(patch);
          navigate(`/people/${id}`, { replace: true });
        }}
        onCancel={() => navigate(`/people/${id}`)}
      />
    </main>
  );
}

export function PeopleSyncRoute() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  return (
    <main className="qilife-page">
      <PersonDashboard
        personId={id}
        defaultTab="sync"
        onBack={() => navigate(`/people/${id}`)}
        onEdit={() => navigate(`/people/${id}/edit`)}
      />
    </main>
  );
}
